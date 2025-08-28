#!/usr/bin/env tsx
import fs from 'node:fs/promises';
import path from 'node:path';

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

async function moveFile(src: string, dest: string) {
  await ensureDir(path.dirname(dest));
  try {
    await fs.rename(src, dest);
    console.log(`Moved: ${path.relative(process.cwd(), src)} -> ${path.relative(process.cwd(), dest)}`);
  } catch (e: unknown) {
    const err = e as { code?: string } | undefined;
    if (err?.code === 'EXDEV') {
      // cross-device: copy & unlink
      const data = await fs.readFile(src);
      await fs.writeFile(dest, data);
      await fs.unlink(src);
      console.log(`Copied+Removed: ${path.relative(process.cwd(), src)} -> ${path.relative(process.cwd(), dest)}`);
    } else {
      throw e;
    }
  }
}

async function main() {
  const root = process.cwd();
  const archiveRoot = path.join(root, 'archive');
  const archiveJson = path.join(archiveRoot, 'json');
  await ensureDir(archiveRoot);
  await ensureDir(archiveJson);

  const names = await fs.readdir(root);

  // 1) Перенести все new-product.backup.*.json из корня в archive/
  for (const name of names) {
    if (name.startsWith('new-product.backup.') && name.endsWith('.json')) {
      const src = path.join(root, name);
      const dest = path.join(archiveRoot, name);
      await moveFile(src, dest);
    }
  }

  // 2) Передвинуть прочие служебные JSON из корня в archive/json (кроме new-product.json)
  for (const name of names) {
    const lower = name.toLowerCase();
    const skip = new Set([
      'new-product.json',
      'package.json',
      'package-lock.json',
      'tsconfig.json',
    ]);
    if (lower.endsWith('.json') && !skip.has(name)) {
      const src = path.join(root, name);
      const dest = path.join(archiveJson, name);
      // пропустим, если файл уже отсутствует (мог быть удалён ранее)
      try {
        const st = await fs.stat(src);
        if (st.isFile()) {
          await moveFile(src, dest);
        }
      } catch {}
    }
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
