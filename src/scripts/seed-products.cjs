const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../node_modules/@prisma/client');

const prisma = new PrismaClient();

function normalizeImagePath(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s || s.toLowerCase() === 'null' || s === '-') return null;
  if (s.startsWith('/uploads/фото/')) return s.replace('/uploads', '');
  if (s.startsWith('/uploads/ФОТО/')) return s.replace('/uploads', '');
  if (s.startsWith('/фото/') || s.startsWith('/ФОТО/') || s.startsWith('/')) return s;
  return `/фото/${s}`;
}

(async () => {
  try {
    const jsonFile = process.env.JSON_FILE || 'new-product.json';
    const jsonPath = path.join(process.cwd(), jsonFile);
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(raw);
    const products = Array.isArray(parsed) ? parsed : (parsed.products || []);

    const input = products.map((p) => {
      const image = normalizeImagePath(p.image ?? p.image_path ?? null);
      const price = Math.round(Number(p.price || 0));
      return {
        title: (p.title || 'Товар').toString().trim(),
        price: Number.isFinite(price) && price > 0 ? price : 1,
        size: p.size ? String(p.size) : null,
        material: p.material ? String(p.material) : null,
        country: p.country ? String(p.country) : null,
        barcode: p.barcode ? String(p.barcode) : null,
        comment: p.comment ? String(p.comment) : null,
        image,
        images: image ? [image] : [],
        isConfirmed: !!image,
        discount: p.discount ? Number(p.discount) : 0,
        category: p.category ? String(p.category) : null,
      };
    });

    // очищаем продукты и вставляем порциями
    await prisma.product.deleteMany();
    const batch = 500;
    for (let i = 0; i < input.length; i += batch) {
      const chunk = input.slice(i, i + batch);
      if (chunk.length === 0) break;
      await prisma.product.createMany({ data: chunk });
      console.log(`Inserted ${Math.min(i + batch, input.length)}/${input.length}`);
    }

    const total = await prisma.product.count();
    console.log('Products in DB:', total);
  } catch (e) {
    console.error('Seed error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
