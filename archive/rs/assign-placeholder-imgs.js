// Назначает placeholder.jpg для всех товаров без image_en
// const fs = require('fs');
// const path = require('path');

// const productFile = path.join(__dirname, '../new-product.with-latin-img.json');
// const data = JSON.parse(fs.readFileSync(productFile, 'utf8'));

// let count = 0;
// for (const product of data.products) {
//   if (!product.image_en || product.image_en === '') {
//     product.image_en = '/placeholder.jpg';
//     count++;
//   }
// }

// fs.writeFileSync(productFile, JSON.stringify(data, null, 2), 'utf8');
// console.log(`Назначено placeholder.jpg для ${count} товаров без фото.`);
