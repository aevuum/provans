// /* eslint-disable */
// const fs = require('fs');
// const path = require('path');

// const TARGET = path.join(process.cwd(), 'new-product.json');

// function load() {
//   const raw = fs.readFileSync(TARGET, 'utf8');
//   const data = JSON.parse(raw);
//   const items = Array.isArray(data) ? data : (data.products || []);
//   return { data, items, isWrapped: !Array.isArray(data) };
// }

// function save(data) {
//   fs.writeFileSync(TARGET, JSON.stringify(data, null, 2), 'utf8');
// }

// function backup(data) {
//   const backupPath = path.join(process.cwd(), 'archive', `new-product.backup.manual-assign.${Date.now()}.json`);
//   fs.mkdirSync(path.dirname(backupPath), { recursive: true });
//   fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf8');
//   return backupPath;
// }

// function assignCategories(items) {
//   let updated = 0;
//   const changes = [];
//   const setCat = (it, to, reason) => {
//     if (it.category !== to) {
//       changes.push({ id: it.id, title: it.title, from: it.category || null, to, reason });
//       it.category = to;
//       updated++;
//     }
//   };

//   // 1) Явные несоответствия: подсвечники с названиями цветов => flowers
//   const idsToFlowers = new Set([275,291,298,325,326,327]);

//   for (const it of items) {
//     const title = String(it.title || '');
//     const t = title.toLowerCase();
//     const empty = !it.category;

//     if (idsToFlowers.has(it.id)) {
//       setCat(it, 'flowers', 'manual-fix-mismatch');
//       continue;
//     }

//     // 2) Пустые категории: "Ф ..." или упоминание рамок => frames
//     if (empty && (/^(ф\b|ф\s)/i.test(title) || /(рамк|фоторамк|фото рамк|фото-рамк)/i.test(t))) {
//       setCat(it, 'frames', 'manual-fill-frames');
//       continue;
//     }

//     // 3) Пустые категории: подсвечник => candlesticks
//     if (empty && /(^|\s)подсвечник(\s|$)|подсвечники|свечник/i.test(t)) {
//       setCat(it, 'candlesticks', 'manual-fill-candlesticks');
//       continue;
//     }

//     // 4) Пустые категории: явные названия цветов => flowers
//     if (empty && /(пион|роза|тюльпан|эвкалипт|гортензия|лаванда|букет|цвет(ы|ок|ок)|композици)/i.test(t)) {
//       setCat(it, 'flowers', 'manual-fill-flowers');
//       continue;
//     }
//   }

//   return { updated, changes };
// }

// (function main(){
//   try {
//     const { data, items, isWrapped } = load();
//     const backupPath = backup(isWrapped ? data : items);
//     const { updated, changes } = assignCategories(items);
//     const out = isWrapped ? { ...data, products: items } : items;
//     save(out);
//     console.log(JSON.stringify({ updated, sample: changes.slice(0, 50), backupPath }, null, 2));
//   } catch (e) {
//     console.error('[manual-assign-categories] Ошибка:', e && e.message ? e.message : e);
//     process.exit(1);
//   }
// })();
