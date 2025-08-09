import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { prisma } from '../src/lib/prisma';

type CsvRow = {
  'Фото'?: string;
  'Фото2'?: string;
  'Фото3'?: string;
  'название': string;
  'размер'?: string;
  'состав/материал'?: string;
  'цена': string;
  'Страна производста'?: string;
  'Штрихкод'?: string;
  'комментарий'?: string;
};

const filePath = path.join(__dirname, '../таблица-тест/2Табличка на сайт основной ассортимент.csv');
const file = fs.readFileSync(filePath, 'utf-8');

const records = parse(file, {
  columns: true,
  skip_empty_lines: true,
  delimiter: ';'
}) as CsvRow[];

function collectImages(row: CsvRow): string[] {
  const images: string[] = [];
  if (row['Фото'] && row['Фото'].trim()) images.push(row['Фото'].trim());
  if (row['Фото2'] && row['Фото2'].trim()) images.push(row['Фото2'].trim());
  if (row['Фото3'] && row['Фото3'].trim()) images.push(row['Фото3'].trim());
  return images;
}

async function main() {
  console.log('🚀 Запуск импорта CSV...');
  console.log(`📋 Найдено ${records.length} записей`);

  // Очищаем таблицу продуктов перед импортом
  await prisma.product.deleteMany();
  console.log('🗑️  Таблица продуктов очищена');

  // Подготавливаем данные для массовой вставки
  const validProducts = [];
  let skipped = 0;

  for (const row of records) {
    // Валидация обязательных полей
    if (!row['название']?.trim() || !row['цена']?.trim()) {
      skipped++;
      continue;
    }

    // Очистка цены от нечисловых символов
    const priceStr = row['цена'].replace(/[^\d]/g, '');
    const price = parseInt(priceStr);
    if (!price || price <= 0) {
      skipped++;
      continue;
    }

    validProducts.push({
      title: row['название'].trim(),
      price: price,
      size: row['размер']?.trim() || null,
      material: row['состав/материал']?.trim() || null,
      country: row['Страна производста']?.trim() || null,
      barcode: row['Штрихкод']?.trim() || null,
      comment: row['комментарий']?.trim() || null,
      image: row['Фото']?.trim() || null,
      images: collectImages(row),
      isConfirmed: false
    });
  }

  console.log(`✅ Валидных продуктов: ${validProducts.length}`);
  console.log(`⚠️  Пропущено записей: ${skipped}`);

  // Массовая вставка для ускорения
  if (validProducts.length > 0) {
    await prisma.product.createMany({
      data: validProducts,
      skipDuplicates: true
    });
    console.log(`💾 Импортировано ${validProducts.length} продуктов`);
  }

  // Статистика
  const totalProducts = await prisma.product.count();
  console.log(`📊 Всего продуктов в базе: ${totalProducts}`);
  console.log('✨ Импорт завершён успешно!');
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});