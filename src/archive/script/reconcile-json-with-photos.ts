// import fs from 'fs/promises'
// import path from 'path'

// interface RawProduct {
//   id?: number
//   title?: string
//   image_path?: string | null
//   price?: number
//   discount?: number
//   size?: string
//   category?: string
//   extra?: Record<string, unknown>
// }

// interface CleanProduct extends RawProduct {
//   id: number
//   title: string
//   image_path: string | null
// }

// function normalizePath(p?: string | null): string | null {
//   if (!p) return null
//   let s = String(p).trim()
//   if (!s || s.toLowerCase() === 'null' || s === '-') return null
//   s = s.split('?')[0].split('#')[0]
//   s = s.replace(/\\/g, '/').replace(/\s+/g, ' ').trim()
//   s = s.replace(/(^|\/)public\//i, '/')
//   if (/^фото\//i.test(s)) s = '/' + s
//   s = s.replace(/\/+/g, '/')
//   return s.toLowerCase()
// }

// function normalizeBaseName(p?: string | null): string {
//   if (!p) return ''
//   try {
//     const n = path.parse(p).name
//     return n.trim().toLowerCase().replace(/\s+/g, ' ')
//   } catch {
//     return ''
//   }
// }

// function normTitle(t?: string | null): string {
//   return (t || '').trim().toLowerCase().replace(/\s+/g, ' ')
// }

// // Levenshtein distance and similarity
// function levenshtein(a: string, b: string): number {
//   if (a === b) return 0
//   const al = a.length, bl = b.length
//   if (al === 0) return bl
//   if (bl === 0) return al
//   const v0 = new Array(bl + 1)
//   const v1 = new Array(bl + 1)
//   for (let i = 0; i <= bl; i++) v0[i] = i
//   for (let i = 0; i < al; i++) {
//     v1[0] = i + 1
//     for (let j = 0; j < bl; j++) {
//       const cost = a.charCodeAt(i) === b.charCodeAt(j) ? 0 : 1
//       v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost)
//     }
//     for (let j = 0; j <= bl; j++) v0[j] = v1[j]
//   }
//   return v0[bl]
// }

// function similarity(a: string, b: string): number {
//   const maxLen = Math.max(a.length, b.length)
//   if (maxLen === 0) return 1
//   return 1 - levenshtein(a, b) / maxLen
// }

// async function listPhotos(dir: string) {
//   const entries = await fs.readdir(dir, { withFileTypes: true })
//   const files = entries.filter((e) => e.isFile()).map((e) => e.name)
//   const filtered = files.filter((f) => !/^\.ds_store$/i.test(f))
//   const items = filtered.map((n) => {
//     const originalFull = `/ФОТО/${n}` // точный регистр как на диске
//     const fullNorm = normalizePath(originalFull)!
//     const base = normalizeBaseName(n)
//     return { fullNorm, originalFull, base, used: false }
//   })
//   const set = new Set(items.map((i) => i.fullNorm))
//   const normToOriginal = new Map(items.map((i) => [i.fullNorm, i.originalFull] as const))
//   return { items, set, normToOriginal }
// }

// async function main() {
//   const fileArg = process.env.JSON_FILE || 'new-product.json'
//   const fuzzyThreshold = Number(process.env.FUZZY_THRESHOLD || '0.9')
//   const photoDir = path.resolve(process.cwd(), 'public', 'ФОТО')

//   console.log(`Читаю JSON: ${fileArg}`)
//   const raw = JSON.parse(await fs.readFile(path.resolve(process.cwd(), fileArg), 'utf8'))
//   const rawProducts: RawProduct[] = Array.isArray(raw.products) ? raw.products : []

//   // 1) Оставляем только товары с title
//   const initialCount = rawProducts.length
//   const productsWithTitle = rawProducts.filter((p) => (p.title && String(p.title).trim().length > 0))

//   // 2) Нормализуем пути и базовые поля
//   const normalized: (RawProduct & { _image_norm: string | null; _title_norm: string; _base_norm: string })[] = productsWithTitle.map((p) => {
//     const imageNorm = normalizePath(p.image_path ?? null)
//     return {
//       ...p,
//       _image_norm: imageNorm,
//       _title_norm: normTitle(p.title),
//       _base_norm: normalizeBaseName(imageNorm || undefined),
//     }
//   })

//   // 3) Удаляем дубли по точному пути фото (100%)
//   const seenPaths = new Set<string>()
//   const deduped: typeof normalized = []
//   let removedDup = 0
//   for (const p of normalized) {
//     if (p._image_norm && seenPaths.has(p._image_norm)) {
//       removedDup++
//       continue
//     }
//     if (p._image_norm) seenPaths.add(p._image_norm)
//     deduped.push(p)
//   }

//   // 4) Загружаем список фото из папки
//   const { items: photoItems, set: photoSet, normToOriginal } = await listPhotos(photoDir)
//   console.log(`Фото в папке: ${photoItems.length}`)

//   // 5) Сопоставление: сначала точное совпадение по полному пути
//   const assigned = new Map<number, { norm: string; display: string }>() // idx -> photo paths
//   const usedPhotos = new Set<string>() // norm

//   for (let i = 0; i < deduped.length; i++) {
//     const p = deduped[i]
//     if (p._image_norm && photoSet.has(p._image_norm)) {
//       const display = normToOriginal.get(p._image_norm) || p._image_norm
//       assigned.set(i, { norm: p._image_norm, display })
//       usedPhotos.add(p._image_norm)
//       const it = photoItems.find((x) => x.fullNorm === p._image_norm)
//       if (it) it.used = true
//     }
//   }

//   // 6) Для оставшихся фото и товаров — fuzzy по названию файла и title/старому пути
//   const unassignedProductIdx = new Set<number>()
//   for (let i = 0; i < deduped.length; i++) if (!assigned.has(i)) unassignedProductIdx.add(i)

//   const unusedPhotos = photoItems.filter((x) => !x.used)

//   type Candidate = { pIdx: number; norm: string; display: string; score: number; source: 'title' | 'path' }
//   const cands: Candidate[] = []

//   for (const photo of unusedPhotos) {
//     for (const i of unassignedProductIdx) {
//       const p = deduped[i]
//       const byTitle = similarity(p._title_norm, photo.base)
//       const byPathBase = p._base_norm ? similarity(p._base_norm, photo.base) : 0
//       const score = Math.max(byTitle, byPathBase)
//       const source: 'title' | 'path' = byTitle >= byPathBase ? 'title' : 'path'
//       if (score >= fuzzyThreshold) {
//         cands.push({ pIdx: i, norm: photo.fullNorm, display: photo.originalFull, score, source })
//       }
//     }
//   }

//   // Жадное сопоставление: лучший score первым, без конфликтов 1:1
//   cands.sort((a, b) => b.score - a.score)
//   for (const c of cands) {
//     if (assigned.has(c.pIdx)) continue
//     if (usedPhotos.has(c.norm)) continue
//     assigned.set(c.pIdx, { norm: c.norm, display: c.display })
//     usedPhotos.add(c.norm)
//     const it = photoItems.find((x) => x.fullNorm === c.norm)
//     if (it) it.used = true
//   }

//   // 7) Формируем финальный список товаров, проставляем image_path из сопоставления, назначаем id
//   const cleaned: CleanProduct[] = []
//   let idCounter = 1
//   for (let i = 0; i < deduped.length; i++) {
//     const p = deduped[i]
//     const assignedPaths = assigned.get(i)
//     const newPath = assignedPaths ? assignedPaths.display : null
//     cleaned.push({
//       ...p,
//       id: idCounter++,
//       title: p.title || '',
//       image_path: newPath,
//     })
//   }

//   // 8) Отчёт
//   const matchedExact = Array.from(assigned.values()).filter((v) => v && v.norm && photoSet.has(v.norm)).length
//   const matchedFuzzy = usedPhotos.size - matchedExact
//   const unusedPhotosLeft = photoItems.filter((x) => !x.used)

//   console.log('Итог:')
//   console.log(`- исходно записей в JSON: ${initialCount}`)
//   console.log(`- товаров с title: ${productsWithTitle.length}`)
//   console.log(`- удалено дублей по путям фото: ${removedDup}`)
//   console.log(`- точных совпадений по пути: ${matchedExact}`)
//   console.log(`- нечетких совпадений по имени: ${matchedFuzzy}`)
//   console.log(`- неиспользованных фото осталось: ${unusedPhotosLeft.length}`)
//   if (unusedPhotosLeft.length > 0) {
//     console.log('Примеры неиспользованных фото:')
//     for (const x of unusedPhotosLeft.slice(0, 10)) console.log('  ', x.originalFull)
//   }

//   // 9) Перезаписываем JSON (с бэкапом)
//   const absFile = path.resolve(process.cwd(), fileArg)
//   const backup = absFile.replace(/\.json$/i, `.backup.${Date.now()}.json`)
//   await fs.copyFile(absFile, backup)
//   await fs.writeFile(absFile, JSON.stringify({ products: cleaned }, null, 2), 'utf8')
//   console.log(`Обновлён файл: ${absFile}`)
//   console.log(`Бэкап: ${backup}`)
// }

// main().catch((e) => {
//   console.error('Ошибка:', e)
//   process.exit(1)
// })
