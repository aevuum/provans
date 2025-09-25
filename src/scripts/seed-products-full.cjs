/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../node_modules/@prisma/client');

const prisma = new PrismaClient();

function normalizeImagePath(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s || s.toLowerCase() === 'null' || s === '-') return null;
  if (s.startsWith('/uploads/фото/')) return s.replace('/uploads', '');
  if (s.startsWith('/фото/') || s.startsWith('/ФОТО/') || s.startsWith('/')) return s;
  return `/фото/${s}`;
}

(async () => {
  try {
    console.log('Seeding from new-product.json');
    const jsonFile = process.env.JSON_FILE || 'new-product.json';
    const jsonPath = path.join(process.cwd(), jsonFile);
    if (!fs.existsSync(jsonPath)) throw new Error('new-product.json not found at ' + jsonPath);
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(raw);
    const products = Array.isArray(parsed) ? parsed : (parsed.products || []);

    // Build category set
    const categoriesMap = new Map(); // slug -> { name, slug }
    for (const p of products) {
      const slug = (p.category || 'uncategorized').toString().trim();
      if (!categoriesMap.has(slug)) {
        categoriesMap.set(slug, { name: slug, slug });
      }
    }

    // Clear products/subcategories/categories but keep users
    console.log('Deleting existing products, subcategories, categories');
    await prisma.product.deleteMany();
    await prisma.subcategory.deleteMany();
    await prisma.category.deleteMany();

    // Ensure sequences start from 1 after mass delete so new ids begin at 1
    async function setSequenceStart(table) {
      try {
        await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence(quote_ident('${table}'), 'id'), 1, false)`);
        console.log(`Sequence for ${table} set to start at 1`);
      } catch (e) {
        console.warn(`Failed to set sequence start for ${table}:`, e && e.message ? e.message : e);
      }
    }

    await setSequenceStart('Product');
    await setSequenceStart('Category');
    await setSequenceStart('Subcategory');

    // Insert categories
    const createdCategories = {};
    for (const [slug, info] of categoriesMap.entries()) {
      const created = await prisma.category.create({ data: {
        name: info.name,
        slug: info.slug,
        description: null,
        image: null,
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }});
      createdCategories[slug] = created.id;
    }

    // Create a default subcategory per category
    const createdSubcategories = {};
    for (const [slug, id] of Object.entries(createdCategories)) {
      const sc = await prisma.subcategory.create({ data: {
        name: slug,
        slug: slug,
        description: null,
        isActive: true,
        sortOrder: 0,
        categoryId: id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }});
      createdSubcategories[slug] = sc.id;
    }

    // Prepare product rows for createMany in batches
    const rows = products.map((p) => {
      const image = normalizeImagePath(p.image ?? p.image_path ?? null);
      const price = Math.round(Number(p.price || 0)) || 0;
      const categorySlug = (p.category || 'uncategorized').toString().trim();
      return {
        title: (p.title || `Товар ${p.id || ''}`).toString().trim().slice(0, 255),
        price: price > 0 ? price : 0,
        size: p.size ? String(p.size).slice(0, 255) : null,
        material: p.material ? String(p.material).slice(0, 255) : null,
        country: p.country ? String(p.country).slice(0, 255) : null,
        barcode: p.barcode ? String(p.barcode) : `js-${p.id || Date.now()}`,
        comment: p.comment ? String(p.comment) : null,
        image,
        images: image ? [image] : [],
        isConfirmed: !!image,
        discount: p.discount ? Number(p.discount) : 0,
        category: categorySlug,
        quantity: p.quantity ? Number(p.quantity) : 0,
        reserved: 0,
        categoryId: createdCategories[categorySlug] || null,
        originalPrice: price || null,
        subcategory: categorySlug,
        subcategoryId: createdSubcategories[categorySlug] || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const batch = 500;
    for (let i = 0; i < rows.length; i += batch) {
      const chunk = rows.slice(i, i + batch);
      await prisma.product.createMany({ data: chunk, skipDuplicates: true });
      console.log(`Inserted ${Math.min(i + batch, rows.length)}/${rows.length}`);
    }

    // After inserting, ensure Postgres sequences are aligned with max(id)
    async function resetSequence(table) {
      try {
        // Use pg_get_serial_sequence with quote_ident to support mixed-case table names
        await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence(quote_ident('${table}'), 'id'), (SELECT COALESCE(MAX(id),0) FROM "${table}") + 1, false)`);
        console.log(`Sequence for ${table} reset`);
      } catch (e) {
        console.warn(`Failed to reset sequence for ${table}:`, e && e.message ? e.message : e);
      }
    }

    await resetSequence('Product');
    await resetSequence('Category');
    await resetSequence('Subcategory');

    console.log('Import complete. Products in DB:', await prisma.product.count());
  } catch (e) {
    console.error('Import error:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
