const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'src', 'frontend', 'lib', 'catalogStructure.ts');
const pagePath = path.join(__dirname, '..', 'src', 'frontend', 'app', 'catalog', 'all-category', 'page.tsx');
const publicDir = path.join(__dirname, '..', 'src', 'frontend', 'public', 'category');

const catalog = fs.readFileSync(catalogPath, 'utf8');
const slugs = [...catalog.matchAll(/slug:\s*'([a-zA-Z0-9-_]+)'/g)].map(m => m[1]);

const page = fs.readFileSync(pagePath, 'utf8');
const imageMapMatch = page.match(/const IMAGE_MAP:[\s\S]*?=\s*\{([\s\S]*?)\};/m);
let imageMap = {};
if (imageMapMatch) {
  const body = imageMapMatch[1];
  const pairs = [...body.matchAll(/['"]?([a-zA-Z0-9-_]+)['"]?\s*:\s*['"]([^'"\n]+)['"]/g)];
  for (const p of pairs) imageMap[p[1]] = p[2];
}

const files = fs.readdirSync(publicDir);

const missing = [];
const details = [];
for (const s of slugs) {
  const hasMap = Object.prototype.hasOwnProperty.call(imageMap, s);
  const fileExists = ['.jpg', '.png', '.JPG', '.jpeg'].some(ext => files.includes(s + ext));
  if (!hasMap && !fileExists) missing.push(s);
  details.push({ slug: s, mapped: hasMap ? imageMap[s] : null, fileExists });
}

console.log('TOTAL_SLUGS:', slugs.length);
console.log('MISSING_COUNT:', missing.length);
if (missing.length) console.log('MISSING_SLUGS:', missing);
console.log('\nSAMPLE_DETAILS:');
console.log(details);

if (missing.length) process.exitCode = 2; else process.exitCode = 0;
