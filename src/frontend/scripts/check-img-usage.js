import fs from 'fs';
import path from 'path';;

// Пути
const productsPath = path.join(process.cwd(), 'new-product.json');
const imgDir = path.join(process.cwd(), 'public', 'img');

// Загрузка товаров
const productsRaw = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const products = Array.isArray(productsRaw) ? productsRaw : (productsRaw.products || []);

// Собираем все используемые изображения из image_en, image, images
const usedImages = new Set();
for (const p of products) {
  if (typeof p.image_en === 'string' && p.image_en) usedImages.add(path.basename(p.image_en));
  if (typeof p.image === 'string' && p.image) usedImages.add(path.basename(p.image));
  if (Array.isArray(p.images)) {
    for (const img of p.images) {
      if (typeof img === 'string' && img) usedImages.add(path.basename(img));
    }
  }
}

// Получаем все файлы в папке img
const imgFiles = fs.readdirSync(imgDir).filter(f => !f.startsWith('.'));

// Фото, которые есть в img, но не используются ни одним товаром
const unused = imgFiles.filter(f => !usedImages.has(f));
// Фото, которые используются, но отсутствуют в img
const missing = Array.from(usedImages).filter(f => !imgFiles.includes(f));

console.log('--- Неиспользуемые фото в img ---');
console.log(unused);
console.log('--- Фото, используемые в товарах, но отсутствующие в img ---');
console.log(missing);

// Проверка: у каких товаров нет ни одного валидного фото
const noPhoto = products.filter(p => {
  const imgs = [p.image_en, p.image, ...(Array.isArray(p.images) ? p.images : [])].filter(Boolean);
  return imgs.length === 0;
});
console.log('--- Товары без фото ---');
console.log(noPhoto.map(p => ({ id: p.id, title: p.title })));
