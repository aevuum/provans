const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '../src/frontend/new-product.json');
if (!fs.existsSync(file)) {
  console.error('file not found', file);
  process.exit(2);
}
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const products = data.products || [];
console.log('totalProducts:', products.length);
const byId = new Map();
const ids = [];
const titleMap = new Map();
const imageMap = new Map();
const missingImage = [];
for (const p of products) {
  if (p.id == null) continue;
  ids.push(p.id);
  if (byId.has(p.id)) byId.get(p.id).push(p);
  else byId.set(p.id, [p]);
  const t = (p.title || '').trim().toLowerCase();
  if (!t) continue;
  if (!titleMap.has(t)) titleMap.set(t, []);
  titleMap.get(t).push(p);
  const img = p.image || '';
  if (!img) missingImage.push(p);
  if (!imageMap.has(img)) imageMap.set(img, []);
  imageMap.get(img).push(p);
}
const dupIds = Array.from(byId.entries()).filter(([,v]) => v.length>1);
const dupTitles = Array.from(titleMap.entries()).filter(([,v]) => v.length>1);
const dupImages = Array.from(imageMap.entries()).filter(([,v]) => v.length>1 && v[0].image);
console.log('duplicate IDs:', dupIds.length);
if (dupIds.length) console.log(dupIds.slice(0,10).map(([id,arr])=> ({id, count:arr.length, samples: arr.slice(0,3).map(x=>({id:x.id,title:x.title}))}))); 
console.log('duplicate Titles:', dupTitles.length);
if (dupTitles.length) console.log(dupTitles.slice(0,10).map(([title,arr]) => ({title, count:arr.length, samples: arr.slice(0,3).map(x=>({id:x.id,title:x.title}))}))); 
console.log('duplicate Images:', dupImages.length);
if (dupImages.length) console.log(dupImages.slice(0,10).map(([img,arr]) => ({image:img, count:arr.length, samples: arr.slice(0,3).map(x=>({id:x.id,title:x.title}))}))); 
console.log('missing image count:', missingImage.length);

// simple heuristic: titles differing by only numbers/spaces
function normalizeTitle(s){
  return (s||'').toLowerCase().replace(/\d+/g, '').replace(/\s+/g,' ').trim();
}
const normMap = new Map();
for (const p of products){
  const n = normalizeTitle(p.title);
  if (!normMap.has(n)) normMap.set(n, []);
  normMap.get(n).push(p);
}
const probableDups = Array.from(normMap.entries()).filter(([,v])=> v.length>1);
console.log('probable duplicates by normalized title:', probableDups.length);
if (probableDups.length) console.log(probableDups.slice(0,10).map(([norm,arr])=>({norm, count:arr.length, samples: arr.slice(0,5).map(x=>({id:x.id,title:x.title,image:x.image}))})));

console.log('\nDone');
