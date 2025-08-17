// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// type Prod = {
//   id: number;
//   title: string;
//   price: number;
//   size: string | null;
//   category: string | null;
//   image: string | null;
//   images: string[];
// };

// function normTitle(t?: string | null) {
//   if (!t) return '';
//   return t
//     .toLowerCase()
//     .replace(/[\(\)\[\]{}]/g, ' ') // скобки
//     .replace(/[^\p{L}\p{N}]+/gu, ' ') // оставить буквы/цифры
//     .replace(/\s+/g, ' ') // сжать пробелы
//     .trim();
// }

// function pickImage(p: Prod) {
//   const img = (p.images?.[0] || p.image || '').trim();
//   return img.replace(/^\/uploads\//, '/');
// }

// async function main() {
//   const expectedMin = 350, expectedMax = 360;
//   const all = await prisma.product.findMany({
//     select: { id: true, title: true, price: true, size: true, category: true, image: true, images: true },
//     orderBy: { id: 'asc' },
//   });
//   const total = all.length;
//   console.log(`Всего товаров в БД: ${total}`);
//   if (total < expectedMin || total > expectedMax) {
//     const expectedMid = (expectedMin + expectedMax) / 2;
//     const delta = total - expectedMid;
//     console.log(`Внимание: ожидалось ${expectedMin}-${expectedMax}. Отклонение: ${delta.toFixed(0)}`);
//   }

//   // Дубликаты по title
//   const byTitle = new Map<string, Prod[]>();
//   for (const p of all) {
//     const key = normTitle(p.title);
//     if (!key) continue;
//     const arr = byTitle.get(key) || [];
//     arr.push(p);
//     byTitle.set(key, arr);
//   }
//   const titleDups = [...byTitle.entries()].filter(([, arr]) => arr.length > 1);

//   // Дубликаты по изображению (основное)
//   const byImage = new Map<string, Prod[]>();
//   for (const p of all) {
//     const key = pickImage(p);
//     if (!key) continue;
//     const arr = byImage.get(key) || [];
//     arr.push(p);
//     byImage.set(key, arr);
//   }
//   const imageDups = [...byImage.entries()].filter(([, arr]) => arr.length > 1);

//   // Строгие дубликаты по (title, price, size)
//   const byTPS = new Map<string, Prod[]>();
//   for (const p of all) {
//     const key = `${normTitle(p.title)}|${p.price}|${(p.size||'').trim()}`;
//     const arr = byTPS.get(key) || [];
//     arr.push(p);
//     byTPS.set(key, arr);
//   }
//   const tpsDups = [...byTPS.entries()].filter(([, arr]) => arr.length > 1);

//   function printGroup(label: string, groups: [string, Prod[]][], limit = 30) {
//     console.log(`\n${label}: найдено групп: ${groups.length}`);
//     for (const [key, arr] of groups.slice(0, limit)) {
//       const ids = arr.map(p => p.id).join(', ');
//       const cats = [...new Set(arr.map(p => p.category || ''))].join(' | ');
//       const prices = [...new Set(arr.map(p => p.price))].join(', ');
//       const sizes = [...new Set(arr.map(p => (p.size||'').trim()))].join(', ');
//       console.log(`- key: "${key}" | count: ${arr.length} | ids: [${ids}] | cat: [${cats}] | price: [${prices}] | size: [${sizes}]`);
//     }
//   }

//   printGroup('Дубликаты по названию', titleDups);
//   printGroup('Дубликаты по изображению', imageDups);
//   printGroup('Дубликаты (название+цена+размер)', tpsDups);

//   // Рекомендации по авто-удалению (НЕ выполняем, только печатаем)
//   const autoRemove: number[] = [];
//   for (const [, arr] of titleDups) {
//     // оставлять товар с фото и ценой > 0, остальные кандидаты — на удаление
//     const withPhoto = arr.filter(p => !!pickImage(p));
//     const withPhotoPrice = withPhoto.filter(p => p.price > 0);
//     const keep = withPhotoPrice[0] || withPhoto[0] || arr[0];
//     for (const p of arr) {
//       if (p.id !== keep.id) autoRemove.push(p.id);
//     }
//   }
//   console.log(`\nКандидатов на удаление (эвристика по названию): ${autoRemove.length}`);
//   console.log(`Пример первых 50 id к удалению: ${autoRemove.slice(0, 50).join(', ')}`);
// }

// main().catch((e) => {
//   console.error(e);
//   process.exit(1);
// }).finally(async () => {
//   await prisma.$disconnect();
// });
