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

function buildGuessFn() {
  // Ключевые слова по требованиям: 7 категорий, без дополнительной сложной логики
  const rx = {
    candlesticks: /(^|\s)подсвечник(\s|$)|подсвечники|свечник/i,
    vases: /ваза|вазы|вазочка/i,
    frames: /рамк|фоторамк|фото[ -]?рамк|рамка|^Ф\b|\/Ф\b/i,
  flowers: /цвет(ы|ок|ок)|букет|композици|роз(а|ы)|пион|тюльпан|эвкалипт|ирис|лили(я|и)|орхиде(я|и)|дендробиум|гортенз(ия|ии)|хризантем(а|ы)|лотос|сирень|акация|эустома|георгин|эремрус|калина|горошек/i,
    jewelry: /шкатулк|шкатулка/i,
  figurines: /фигур|статуэт|скульпт|ангел|балерин|клоун|слон|сова|кот|кошка|петух|лебед|черепах|бульдог|попуга(й|и)|жираф|лошад|мальчик|девочк|африканск|бык|коник|олень|собак|птиц|цыпл|кур(иц|)|птенец|фламинго|кольцоносец|кролик|будда|микки|панда|конь|индус|бюст|декор|лягушка|заяц|мама|ребенок|носорог|кузнечик|макс|паддинктон|купидон|динозавр|орел|лиса|медведь|слон|фрида|молекула|улитка|индус|макс|паддинктон|купидон|фигурка|статуэтка|скульптура/i,
    bookends: /книгодержат|подставка\s+для\s+книг|держател[ья]\s+для\s+книг/i,
  };

  const allowed = new Set(['bookends','candlesticks','figurines','flowers','frames','jewelry-boxes','vases']);

  return function guessCategory(item) {
    const title = String(item.title || '');
    const img = String(item.image || '');
    const hay = `${title}\n${img}`;

    if (rx.candlesticks.test(hay)) return 'candlesticks';
    if (rx.vases.test(hay)) return 'vases';
    if (rx.frames.test(hay)) return 'frames';
    if (rx.flowers.test(hay)) return 'flowers';
    if (rx.jewelry.test(hay)) return 'jewelry-boxes';
    if (rx.figurines.test(hay)) return 'figurines';
    if (rx.bookends.test(hay)) return 'bookends';

    return null;
  };
}

(function main() {
  try {
    const { p, data, items, isWrapped } = loadProducts();
    const backup = path.join(path.dirname(p), `new-product.backup.${Date.now()}.json`);
    fs.writeFileSync(backup, JSON.stringify(data, null, 2), 'utf8');

    const allowed = new Set(['bookends','candlesticks','figurines','flowers','frames','jewelry-boxes','vases']);
    const guessCategory = buildGuessFn();

    let updated = 0; let fixedWithImage = 0;
    const changes = [];

    for (const it of items) {
      const prev = it.category ? String(it.category) : '';
      const guess = guessCategory(it);

      // Требование: расставлять 100% только для товаров С ФОТО и с пустой категорией
      if (it.image && !prev && guess) {
        it.category = guess;
        updated++;
        fixedWithImage++;
        changes.push({ id: it.id, title: it.title, from: null, to: guess, reason: 'fill-empty-with-image' });
      }
    }

    const out = isWrapped ? { ...data, products: items } : items;
    fs.writeFileSync(p, JSON.stringify(out, null, 2), 'utf8');

    console.log(JSON.stringify({ updated, fixedWithImage, changesSample: changes.slice(0, 50) }, null, 2));
    console.log('Backup saved to:', backup);
    console.log('Updated file:', p);
  } catch (e) {
    console.error('[normalize-categories] Ошибка:', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
