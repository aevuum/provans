/* eslint-disable */
const fs = require('fs');
const path = require('path');

function load() {
  const candidates = [
    path.join(process.cwd(), 'new-product.json'),
    path.join(__dirname, '..', 'new-product.json'),
  ];
  let p = '';
  let raw = '';
  let data;

  for (const c of candidates) {
    try {
      raw = fs.readFileSync(c, 'utf8');
      p = c;
      break;
    } catch {
      // try next path
    }
  }

  if (!p) {
    throw new Error(`Не найден new-product.json. Пробовал: ${candidates.join(' | ')}`);
  }

  try {
    data = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Некорректный JSON в ${p}: ${(e && e.message) || e}`);
  }

  const products = Array.isArray(data) ? data : (data.products || []);
  return { p, data, products, isWrapped: !Array.isArray(data) };
}

function guessCategory(title) {
  const t = (title || '').toLowerCase();
  const hits = [];
  const add = (cat, score) => hits.push({ cat, score });

  // Ключевые слова с весами
  if (/(^|\s)подсвечник(\s|$)|подсвечники|свечник/.test(t)) add('candlesticks', 10);
  if (/ваза|вазы|вазочка/.test(t)) add('vases', 10);
  // Рамки: явные слова и распространённая аббревиатура "Ф ..."
  if (/(^|\s)ф\b|рамк|фоторамк|фото рамк|фото-рамк/.test(t)) add('frames', 10);
  if (/цвет(ы|ок|ок)|букет|композици|роз(а|ы)|пион|тюльпан|эвкалипт/.test(t)) add('flowers', 7);
  if (/шкатулк/.test(t)) add('jewelry-boxes', 10);
  if (/фигур|статуэт|скульпт|ангел|nao/.test(t)) add('figurines', 10);
  if (/книгодержат|подставка\s+для\s+книг/.test(t)) add('bookends', 10);

  if (!hits.length) return null;
  hits.sort((a, b) => b.score - a.score);
  // если есть несколько с одинаковым скором и конфликт — считаем неуверенно
  if (hits.length > 1 && hits[0].score === hits[1].score) return null;
  return hits[0].cat;
}

(function main() {
  try {
    const { p, data, products, isWrapped } = load();
    const ts = Date.now();
    const backup = path.join(path.dirname(p), `new-product.backup.${ts}.json`);
    fs.writeFileSync(backup, JSON.stringify(data, null, 2), 'utf8');

    const allowed = new Set(['bookends','candlesticks','figurines','flowers','frames','jewelry-boxes','vases']);
    let updated = 0;
    const changes = [];

    products.forEach((prod) => {
      const current = prod.category ? String(prod.category) : '';
      const guess = guessCategory(prod.title);

      // Добавляем, если пусто/null
      if (!current && guess) {
        prod.category = guess;
        updated++;
        changes.push({ id: prod.id, title: prod.title, from: current || null, to: guess, reason: 'fill-empty' });
        return;
      }

      // Если неправильное значение (не из справочника), переписываем на guess при уверенности
      if (current && !allowed.has(current) && guess) {
        prod.category = guess;
        updated++;
        changes.push({ id: prod.id, title: prod.title, from: current, to: guess, reason: 'normalize-unknown' });
        return;
      }

      // Если из allowed, но есть уверенный guess и он другой — правим (только для явных конфликтов фигура/подсвечник/ваза/рамка)
      if (current && allowed.has(current) && guess && guess !== current) {
        // Не меняем рамки на цветы, даже если в названии есть "розы" и т.п.
        if (current === 'frames' && guess === 'flowers') {
          return;
        }
        const strong = new Set(['candlesticks','vases','frames','figurines']);
        if (strong.has(guess)) {
          prod.category = guess;
          updated++;
          changes.push({ id: prod.id, title: prod.title, from: current, to: guess, reason: 'confident-mismatch' });
        }
      }
    });

    const out = isWrapped ? { ...data, products } : products;
    fs.writeFileSync(p, JSON.stringify(out, null, 2), 'utf8');

    console.log(JSON.stringify({ updated, changesSample: changes.slice(0, 30) }, null, 2));
  } catch (err) {
    console.error('[fix-categories-from-titles] Ошибка:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
