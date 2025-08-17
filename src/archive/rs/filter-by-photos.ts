// import { PrismaClient } from '@prisma/client'
// import fs from 'fs/promises'
// import fsSync from 'fs'
// import path from 'path'

// const prisma = new PrismaClient()

// function normalizePath(p?: string | null) {
//   if (!p) return null
//   try {
//     let s = p.trim()
//     // strip query/hash
//     s = s.split('?')[0].split('#')[0]
//     // normalize slashes
//     s = s.replace(/\\/g, '/')
//     // map 'public/...' to root-based
//     s = s.replace(/(^|\/)public\//i, '/')
//     // ensure leading slash for 'ФОТО/...'
//     if (/^ФОТО\//i.test(s)) s = '/' + s
//     // collapse multiple slashes
//     s = s.replace(/\/+/g, '/')
//     return s.toLowerCase()
//   } catch {
//     return null
//   }
// }

// function normalizeBaseName(p?: string | null) {
//   if (!p) return null
//   try {
//     const n = path.parse(p).name
//     return n.trim().toLowerCase().replace(/\s+/g, ' ')
//   } catch {
//     return null
//   }
// }

// // Levenshtein distance
// function levenshtein(a: string, b: string): number {
//   if (a === b) return 0
//   const al = a.length
//   const bl = b.length
//   if (al === 0) return bl
//   if (bl === 0) return al
//   const v0 = new Array(bl + 1)
//   const v1 = new Array(bl + 1)
//   for (let i = 0; i <= bl; i++) v0[i] = i
//   for (let i = 0; i < al; i++) {
//     v1[0] = i + 1
//     const ac = a.charCodeAt(i)
//     for (let j = 0; j < bl; j++) {
//       const cost = ac === b.charCodeAt(j) ? 0 : 1
//       v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost)
//     }
//     for (let j = 0; j <= bl; j++) v0[j] = v1[j]
//   }
//   return v0[bl]
// }

// function similarity(a: string, b: string): number {
//   const maxLen = Math.max(a.length, b.length)
//   if (maxLen === 0) return 1
//   const dist = levenshtein(a, b)
//   return 1 - dist / maxLen
// }

// async function listPhotoPaths(dir: string) {
//   try {
//     const entries = await fs.readdir(dir, { withFileTypes: true })
//     const files = entries.filter((e) => e.isFile()).map((e) => e.name)
//     const set = new Set<string>()
//     const arr: { full: string; base: string }[] = []
//     for (const n of files) {
//       const full = normalizePath(`/ФОТО/${n}`)
//       if (full) {
//         set.add(full)
//         arr.push({ full, base: normalizeBaseName(n) || '' })
//       }
//     }
//     return { set, arr }
//   } catch (e: unknown) {
//     const msg = e instanceof Error ? e.message : String(e)
//     console.error('Не удалось прочитать папку ФОТО:', msg)
//     return { set: new Set<string>(), arr: [] as { full: string; base: string }[] }
//   }
// }

// function parseThreshold(): number {
//   const arg = process.argv.find((a) => a.startsWith('--threshold='))
//   if (arg) {
//     const v = Number(arg.split('=')[1])
//     if (!Number.isNaN(v) && v > 0 && v <= 1) return v
//   }
//   return 0.92
// }

// async function main() {
//   const apply = process.argv.includes('--apply')
//   const del = process.argv.includes('--delete')
//   const fuzzy = process.argv.includes('--fuzzy')
//   const threshold = parseThreshold()
//   const candidates = ['ФОТО', 'фото'].map((n) => path.resolve(process.cwd(), 'public', n))
//   const photoDirs = candidates.filter((p) => {
//     try { return fsSync.existsSync(p) && fsSync.statSync(p).isDirectory() } catch { return false }
//   })

//   // собираем файлы из всех найденных папок
//   const merged = { set: new Set<string>(), arr: [] as { full: string; base: string }[] }
//   for (const d of photoDirs) {
//     const { set, arr } = await listPhotoPaths(d)
//     for (const s of set) merged.set.add(s)
//     merged.arr.push(...arr)
//   }
//   const photoPaths = merged.set
//   const photoList = merged.arr

//   console.log(`Файлов в 'фото/ФОТО': ${photoPaths.size}`)

//   const products = await prisma.product.findMany({
//     select: { id: true, title: true, image: true, images: true, isConfirmed: true },
//     orderBy: { id: 'asc' },
//   })

//   const keepIds: number[] = []
//   const dropIds: number[] = []
//   const mainOnlyKeepIds: number[] = []

//   const diagnostics: Array<{ id: number; bestScore: number; matched: string; source: string }> = []

//   for (const p of products) {
//     const mainPath = normalizePath(p.image) || ''
//     const mainBase = normalizeBaseName(p.image) || ''

//     let exactMain = false
//     if (mainPath && photoPaths.has(mainPath)) {
//       mainOnlyKeepIds.push(p.id)
//       exactMain = true
//     }

//     let match = false
//     if (!fuzzy) {
//       if (exactMain) match = true
//       if (!match) {
//         for (const img of p.images || []) {
//           const ip = normalizePath(img)
//           if (ip && photoPaths.has(ip)) { match = true; break }
//         }
//       }
//       if (match) keepIds.push(p.id)
//       else dropIds.push(p.id)
//       continue
//     }

//     // Fuzzy mode: evaluate best similarity against photoList (by full path and by base name)
//     let bestScore = 0
//     let bestTarget = ''
//     let bestSource = ''

//     const candidates: string[] = []
//     if (mainPath) candidates.push(mainPath)
//     if (mainBase) candidates.push(mainBase)
//     for (const img of p.images || []) {
//       const ip = normalizePath(img)
//       const ib = normalizeBaseName(img)
//       if (ip) candidates.push(ip)
//       if (ib) candidates.push(ib)
//     }

//     for (const cand of candidates) {
//       for (const t of photoList) {
//         const s1 = cand
//         let score = 0
//         if (cand.includes('/')) {
//           // looks like a path → compare with full
//           score = similarity(s1, t.full)
//         } else {
//           // looks like a name → compare with base
//           score = similarity(s1, t.base)
//         }
//         if (score > bestScore) {
//           bestScore = score
//           bestTarget = t.full
//           bestSource = cand
//         }
//       }
//     }

//     diagnostics.push({ id: p.id, bestScore, matched: bestTarget, source: bestSource })
//     if (bestScore >= threshold) { keepIds.push(p.id) } else { dropIds.push(p.id) }
//   }

//   console.log(`Всего товаров: ${products.length}`)
//   if (!fuzzy) {
//     console.log(`Совпало по ПОЛНОМУ пути (только основное фото): ${mainOnlyKeepIds.length}`)
//     console.log(`Совпало по ПОЛНОМУ пути (любое из image|images[]): ${keepIds.length}`)
//     console.log(`Не найдено точного пути в фото/ФОТО: ${dropIds.length}`)
//   } else {
//     console.log(`Нечёткий режим (--fuzzy). Порог: ${threshold}`)
//     console.log(`Совпало по нечеткому сходству: ${keepIds.length}`)
//     console.log(`Не прошло порог: ${dropIds.length}`)
//     // Показать пару крайних случаев для контроля
//     const sorted = diagnostics.sort((a, b) => a.bestScore - b.bestScore)
//     const worst = sorted.slice(0, 5)
//     const best = sorted.slice(-5).reverse()
//     console.log('Худшие совпадения (id, score, source -> matched):')
//     for (const w of worst) console.log(`${w.id}\t${w.bestScore.toFixed(3)}\t${w.source} -> ${w.matched}`)
//     console.log('Лучшие совпадения (id, score, source -> matched):')
//     for (const b of best) console.log(`${b.id}\t${b.bestScore.toFixed(3)}\t${b.source} -> ${b.matched}`)
//   }

//   if (!apply && !del) {
//     console.log('Режим dry-run. Добавьте --apply для установки isConfirmed или --delete для удаления не совпавших.')
//     return
//   }

//   if (apply) {
//     const chunk = 500
//     for (let i = 0; i < keepIds.length; i += chunk) {
//       const ids = keepIds.slice(i, i + chunk)
//       await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isConfirmed: true } })
//     }
//     for (let i = 0; i < dropIds.length; i += chunk) {
//       const ids = dropIds.slice(i, i + chunk)
//       await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isConfirmed: false } })
//     }
//     console.log(`Готово: isConfirmed обновлён по результатам ${fuzzy ? 'нечёткого' : 'точного'} сопоставления.`)
//   }

//   if (del) {
//     const chunk = 200
//     let deleted = 0
//     for (let i = 0; i < dropIds.length; i += chunk) {
//       const ids = dropIds.slice(i, i + chunk)
//       const res = await prisma.product.deleteMany({ where: { id: { in: ids } } })
//       deleted += res.count
//     }
//     console.log(`Удалено товаров: ${deleted}`)
//   }
// }

// main()
//   .catch((e) => {
//     console.error(e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })
