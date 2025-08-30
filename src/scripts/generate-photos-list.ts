import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');
const photoDirs = ['фото', 'ФОТО'].map((d) => path.join(publicDir, d));
const output = path.join(publicDir, 'photos-list.json');

function getFiles(dir: string) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
  });
}

const allFiles = photoDirs.flatMap(getFiles);

fs.writeFileSync(output, JSON.stringify(allFiles, null, 2), 'utf-8');
console.log(`Список фото (${allFiles.length}) сохранён в ${output}`);
