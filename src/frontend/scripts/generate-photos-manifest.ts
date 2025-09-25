#!/usr/bin/env tsx
import { promises as fs } from 'fs';
import path from 'path';

async function main() {
  // Prefer repo root public/, but fall back to src/frontend/public
  const candidate1 = path.join(process.cwd(), 'public');
  const candidate2 = path.join(process.cwd(), 'src', 'frontend', 'public');
  let publicDir = candidate1;
  // Choose existing directory
  try {
    const stat = await fs.stat(candidate1).catch(() => null);
    if (!stat || !stat.isDirectory()) {
      publicDir = candidate2;
    }
  } catch {
    publicDir = candidate2;
  }
  const outFile = path.join(publicDir, 'photos-manifest.json');

  // Ensure output directory exists
  await fs.mkdir(publicDir, { recursive: true }).catch(() => {});
  const list: string[] = [];

  async function walk(dir: string, relBase = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const e of entries) {
      const rel = relBase ? path.posix.join(relBase, e.name) : e.name;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full, rel);
      } else if (/\.(jpe?g|png|webp)$/i.test(e.name)) {
        list.push('/' + rel.replace(/\\/g, '/'));
      }
    }
  }

  await walk(publicDir, '');

  const index: Record<string, string> = {};
  for (const p of list) {
    const fileName = path.posix.basename(p);
    const key = fileName.toLowerCase().replace(/%20/g, '').replace(/\s+/g, '').replace(/\.(jpe?g|png|webp)$/i, '');
    if (!index[key]) index[key] = p;
  }

  const payload = { generatedAt: new Date().toISOString(), total: list.length, files: list, index };
  await fs.writeFile(outFile, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`photos-manifest.json generated (all public): ${list.length} файлов.`);
}

main().catch(e => { console.error(e); process.exit(1); });
