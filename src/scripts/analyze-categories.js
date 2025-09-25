/* eslint-disable */
const fs = require('fs');
const path = require('path');

function loadProducts() {
  const candidates = [
    path.join(process.cwd(), 'new-product.json'),
    path.join(__dirname, '..', 'new-product.json'),
  ];
  for (const p of candidates) {
    try {
      const raw = fs.readFileSync(p, 'utf8');
      const data = JSON.parse(raw);
      const items = Array.isArray(data) ? data : (data.products || []);
      return { p, data, items, isWrapped: !Array.isArray(data) };
    } catch (e) {
      // try next
    }
  }
  throw new Error('Не найден new-product.json');
}

function analyze(items) {
  const allowed = new Set(['bookends','candlesticks','figurines','flowers','frames','jewelry-boxes','vases']);
  const kw = {
    candlesticks: /(^|\s)подсвечник(\s|$)|подсвечники|свечник/i,
    vases: /ваза|вазы|вазочка/i,
    frames: /рамк|фоторамк|фото рамк|фото-рамк/i,
    flowers: /цвет(ы|ок|ок)|букет|композици|роз(а|ы)|пион|тюльпан|эвкалипт/i,
    jewelry: /шкатулк/i,
    figurines: /фигур|статуэт|скульпт|ангел|nao/i,
    bookends: /книгодержат|подставка\s+для\s+книг/i,
  };

  const counts = {};
  const empty = [];
  const invalid = [];
  const mismatches = [];

  for (const it of items) {
    const c = it.category ? String(it.category) : '';
    counts[c] = (counts[c] || 0) + 1;
    const t = String(it.title || '');
    const guess = kw.candlesticks.test(t) ? 'candlesticks' :
      kw.vases.test(t) ? 'vases' :
      kw.frames.test(t) ? 'frames' :
      kw.flowers.test(t) ? 'flowers' :
      kw.jewelry.test(t) ? 'jewelry-boxes' :
      kw.figurines.test(t) ? 'figurines' :
      kw.bookends.test(t) ? 'bookends' : null;

    if (!c) {
      empty.push({ id: it.id, title: it.title, guess });
    } else if (!allowed.has(c)) {
      invalid.push({ id: it.id, title: it.title, category: c, guess });
    } else if (guess && guess !== c) {
      mismatches.push({ id: it.id, title: it.title, from: c, to: guess });
    }
  }

  return { total: items.length, counts, empty, invalid, mismatches };
}

(function main() {
  try {
    const { items } = loadProducts();
    const res = analyze(items);

    const outDir = path.join(process.cwd(), 'docs', 'backups');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'category-audit.json');

    const summary = {
      total: res.total,
      counts: res.counts,
      empty: res.empty.length,
      invalid: res.invalid.length,
      mismatches: res.mismatches.length,
      samples: {
        empty: res.empty.slice(0, 30),
        invalid: res.invalid.slice(0, 30),
        mismatches: res.mismatches.slice(0, 100),
      },
    };

    fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8');

    console.log('Category audit written to:', outPath);
    console.log(JSON.stringify({
      total: summary.total,
      empty: summary.empty,
      invalid: summary.invalid,
      mismatches: summary.mismatches,
    }, null, 2));
  } catch (e) {
    console.error('[analyze-categories] Ошибка:', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
