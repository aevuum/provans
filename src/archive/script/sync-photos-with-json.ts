// import fs from 'fs/promises'
// import fss from 'fs'
// import path from 'path'

// interface Product { id: number; image?: string | null }

// const repoRoot = process.cwd()
// const photoDir = path.resolve(repoRoot, 'public', 'фото')
// const archiveDir = path.resolve(repoRoot, 'public', 'архив', 'фото-старые')

// function normName(s: string) {
//   return s.toLocaleLowerCase('ru-RU').replace(/\s+/g, ' ').trim()
// }

// async function listFiles(dir: string) {
//   const out: string[] = []
//   const entries = await fs.readdir(dir, { withFileTypes: true })
//   for (const d of entries) {
//     if (d.isFile()) out.push(d.name)
//   }
//   return out
// }

// async function ensureDir(p: string) {
//   await fs.mkdir(p, { recursive: true })
// }

// async function main() {
//   await ensureDir(archiveDir)

//   const raw = await fs.readFile(path.join(repoRoot, 'new-product.json'), 'utf-8')
//   const parsed = JSON.parse(raw) as { products?: Product[] } | Product[]
//   const products: Product[] = Array.isArray(parsed) ? parsed : (parsed.products || [])

//   const files = await listFiles(photoDir)
//   const normMap = new Map<string, string>()
//   for (const name of files) {
//     normMap.set(normName(name), name)
//   }

//   let copied = 0, archived = 0, exact = 0, missing = 0
//   for (const p of products) {
//     const img = p.image
//     if (!img || !img.startsWith('/фото/')) continue
//     const desiredName = img.slice('/фото/'.length)
//     const desiredPath = path.join(photoDir, desiredName)

//     if (fss.existsSync(desiredPath)) { exact++; continue }

//     const foundActual = normMap.get(normName(desiredName))
//     if (!foundActual) { missing++; continue }

//     const actualPath = path.join(photoDir, foundActual)

//     // Создаём новый файл с правильным именем
//     if (!fss.existsSync(desiredPath)) {
//       await fs.copyFile(actualPath, desiredPath)
//       copied++
//     }

//     // Перемещаем старый файл в архив
//     let target = path.join(archiveDir, foundActual)
//     if (fss.existsSync(target)) {
//       const ext = path.extname(foundActual)
//       const base = path.basename(foundActual, ext)
//       target = path.join(archiveDir, `${base}.${Date.now()}${ext}`)
//     }
//     await fs.rename(actualPath, target)
//     archived++
//   }

//   // Проверка совпадений
//   let withImg = 0, found = 0
//   const missList: { id: number, image: string }[] = []
//   for (const p of products) {
//     if (p.image && p.image.startsWith('/фото/')) {
//       withImg++
//       const pth = path.join(repoRoot, 'public', p.image)
//       if (fss.existsSync(pth)) found++
//       else missList.push({ id: p.id, image: p.image! })
//     }
//   }

//   console.log(`Готово. exact:${exact}, скопировано:${copied}, в архив:${archived}, отсутствуют:${missing}`)
//   console.log(`Проверка: с фото ${withImg}, найдено ${found}, не найдено ${withImg - found}`)
//   if (missList.length) {
//     console.log('Примеры отсутствующих:', missList.slice(0, 10))
//   }
// }

// main().catch((e) => { console.error(e); process.exit(1) })
