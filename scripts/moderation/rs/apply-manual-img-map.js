// Скрипт для применения ручного сопоставления фото к товарам
// Использует manual-img-map.json и обновляет image_en в new-product.with-latin-img.json

// const fs = require('fs');
// const path = require('path');

// const mapPath = path.join(__dirname, 'manual-img-map.json');
// const productsPath = path.join(__dirname, '../new-product.with-latin-img.json');

// const manualMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
// const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// const idToImg = Object.fromEntries(manualMap.map(({id, image_en}) => [id, image_en]));

// let changed = 0;
// productsData.products.forEach(prod => {
//   if (idToImg[prod.id]) {
//     prod.image_en = idToImg[prod.id];
//     changed++;
//   }
// });

// fs.writeFileSync(productsPath, JSON.stringify(productsData, null, 2), 'utf8');
// console.log(`Обновлено image_en для ${changed} товаров.`);
