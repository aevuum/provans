// Автоматически распределяет неиспользуемые фото по товарам без фото
// и обновляет поле image_en в new-product.with-latin-img.json

import fs from 'fs';
import path from 'path';


const productFile = path.join(__dirname, '../new-product.with-latin-img.json');
const unusedImgFile = path.join(__dirname, './ununsed-img-list.json');

// Чтение файла с товарами
const data = JSON.parse(fs.readFileSync(productFile, 'utf8'));

// Чтение списка неиспользуемых фото (ручная очистка от лишних строк)
const unusedImgs = [
  'angel-1.jpeg','angel-2.jpeg','angel-3.jpeg','angel-4.jpeg','angel-5.jpeg','angel-6.jpeg','angel-7.jpeg','ballerina-1.jpeg','ballerina-2.jpeg','ballerina-3.jpeg','ballerina-4.jpeg','bird-1.jpeg','bird-2.jpeg','box-1.jpeg','box-2.jpeg','box-3.jpeg','box-4.jpeg','box-5.jpeg','box-6.jpeg','box-7.jpeg','box-8.jpeg','boy-1.jpeg','buddha-1.jpeg','buddha-2.jpeg','buddha-3.jpeg','bunny-1.jpeg','bunny-2.jpeg','bunny-3.jpeg','candlestick-1.jpeg','candlestick-10.jpeg','candlestick-11.jpeg','candlestick-12.jpeg','candlestick-13.jpeg','candlestick-14.jpeg','candlestick-15.jpeg','candlestick-16.jpeg','candlestick-17.jpeg','candlestick-18.jpeg','candlestick-19.jpeg','candlestick-2.jpeg','candlestick-20.jpeg','candlestick-21.jpeg','candlestick-22.jpeg','candlestick-23.jpeg','candlestick-24.jpeg','candlestick-25.jpeg','candlestick-26.jpeg','candlestick-27.jpeg','candlestick-28.jpeg','candlestick-29.jpeg','candlestick-3.jpeg','candlestick-30.jpeg','candlestick-31.jpeg','candlestick-32.jpeg','candlestick-33.jpeg','candlestick-34.jpeg','candlestick-35.jpeg','candlestick-36.jpeg','candlestick-37.jpeg','candlestick-38.jpeg','candlestick-39.jpeg','candlestick-4.jpeg','candlestick-40.jpeg','candlestick-41.jpeg','candlestick-42.jpeg','candlestick-43.jpeg','candlestick-44.jpeg','candlestick-45.jpeg','candlestick-46.jpeg','candlestick-47.jpeg','candlestick-48.jpeg','candlestick-49.jpeg','candlestick-5.jpeg','candlestick-50.jpeg','candlestick-51.jpeg','candlestick-52.jpeg','candlestick-53.jpeg','candlestick-54.jpeg','candlestick-55.jpeg','candlestick-56.jpeg','candlestick-57.jpeg','candlestick-58.jpeg','candlestick-59.jpeg','candlestick-6.jpeg','candlestick-60.jpeg','candlestick-61.jpeg','candlestick-62.jpeg','candlestick-7.jpeg','candlestick-8.jpeg','candlestick-9.jpeg','cat-1.jpeg','clown-1.jpeg','clown-2.jpeg','clown-3.jpeg','clown-4.jpeg','clown-5.jpeg','clown-6.jpeg','clown-7.jpeg','decor-1.jpeg','decor-2.jpeg'
  // ...добавить остальные из полного списка при необходимости
];

// Список id товаров без фото (ручной перенос из анализа)
const productsWithoutImg = [4,22,65,66,67,68,69,70,71,82,100,134,155,158,176,209,210,212,213,214,218,219,220,222,223,265,267,269,270,271,272,280,282,297,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,385,388,391,401,402,405,406,407,410,412,413,419,421,6104];

let imgIdx = 0;
for (const product of data.products) {
  if (productsWithoutImg.includes(product.id) && imgIdx < unusedImgs.length) {
    product.image_en = '/img/' + unusedImgs[imgIdx];
    imgIdx++;
  }
}

fs.writeFileSync(productFile, JSON.stringify(data, null, 2), 'utf8');

console.log(`Назначено ${imgIdx} фото товарам без фото. Осталось неиспользованных фото: ${unusedImgs.length - imgIdx}`);
