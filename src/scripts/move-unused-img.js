import fs from 'fs';
import path from 'path';

const imgDir = path.join(process.cwd(), 'public', 'img');
const archiveDir = path.join(process.cwd(), 'archive', 'img');

// Список неиспользуемых фото (выводился ранее)
const unused = [
  // ... (сюда нужно подставить список из предыдущего анализа)
];

for (const file of unused) {
  const src = path.join(imgDir, file);
  const dest = path.join(archiveDir, file);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Перемещено: ${file}`);
  }
}

console.log('Готово!');
