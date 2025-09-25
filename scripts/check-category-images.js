const fs = require('fs');
const path = require('path');
const catalogPath = path.join(__dirname, '..', 'src', 'frontend', 'lib', 'catalogStructure.ts');
const publicDir = path.join(__dirname, '..', 'src', 'frontend', 'public', 'category');

const catalog = fs.readFileSync(catalogPath, 'utf8');
const slugs = [...catalog.matchAll(/slug:\s*'([a-zA-Z0-9-_]+)'/g)].map(m => m[1]);
const files = fs.readdirSync(publicDir);

const map = {};
const missing = [];
for (const s of slugs) {
  const poss = [s + '.jpg', s + '.png', s + '.JPG', s + '.jpeg'];
  const found = poss.find(p => files.includes(p));
  if (found) map[s] = '/category/' + found;
  else {
    // try some common fallbacks
    if (s === 'bouquets' && files.includes('flowers.jpg')) map[s] = '/category/flowers.jpg';
    else if (s === 'pilows' && files.includes('pillows.png')) map[s] = '/category/pillows.png';
    else missing.push(s);
  }
}

console.log('FILES_IN_CATEGORY_DIR:', files.length);
console.log('MAPPING_COUNT:', Object.keys(map).length);
if (missing.length) {
  console.log('MISSING_SLUGS:', missing);
  process.exitCode = 2;
} else {
  console.log('ALL_OK');
}

console.log('\nSAMPLE_MAPPING:');
Object.entries(map).slice(0,30).forEach(([k,v]) => console.log(k+' -> '+v));
