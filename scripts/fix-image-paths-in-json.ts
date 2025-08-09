import fs from 'fs/promises'
import path from 'path'

interface Product {
  title: string
  image: string | null
  price: number
  discount: number
  size: string | null
  category: string | null
  id: number
}

function upperFirstChar(name: string) {
  if (!name) return name
  const first = name[0]
  const rest = name.slice(1)
  return first.toLocaleUpperCase('ru-RU') + rest
}

function fixSpecificNames(name: string): string {
  let next = name
  next = next.replace(/\s{2,}(?=(\d+)\.(jpe?g))$/iu, ' ')

  const patternsZolotoyKayomka = [
    /^ф\sчерная\sобъемная\sс\sзолотой\s+кайомкой\.jpe?g$/iu,
    /^Ф\sчерная\sобъемная\sс\sзолотой\s+кайомкой\.jpe?g$/iu,
  ]
  if (patternsZolotoyKayomka.some((re) => re.test(next))) {
    next = 'Ф черная объемная с золотым.jpeg'
  }

  next = next
    .replace(/^Цыпленок\sс\sфиалкой\s{2}2\.jpe?g$/iu, 'Цыпленок с фиалкой 2.jpeg')
    .replace(/^Подсвечник\sметалл\sсеребряный\sузкий\s{2}3\.jpe?g$/iu, 'Подсвечник металл серебряный узкий 3.jpeg')

  return next
}

async function run() {
  const repoRoot = process.cwd()
  const jsonPath = path.join(repoRoot, 'new-product.json')
  const backupPath = path.join(repoRoot, `new-product.backup.${Date.now()}.json`)

  const raw = await fs.readFile(jsonPath, 'utf-8')
  const parsed = JSON.parse(raw) as { products?: Product[] } | Product[]
  const products = Array.isArray(parsed) ? parsed : parsed.products || []

  await fs.writeFile(backupPath, raw, 'utf-8')

  let changed = 0
  const updated = products.map((p) => {
    if (!p || !p.image || !p.image.startsWith('/фото/')) return p

    const dir = '/фото/'
    const name = p.image.slice(dir.length)

    let fixed = fixSpecificNames(name)
    fixed = upperFirstChar(fixed)

    const nextPath = dir + fixed
    if (nextPath !== p.image) {
      changed++
      return { ...p, image: nextPath }
    }
    return p
  })

  const out = JSON.stringify({ products: updated }, null, 2)
  await fs.writeFile(jsonPath, out + '\n', 'utf-8')

  console.log(`Готово. Изменено записей: ${changed}.\nБэкап: ${path.basename(backupPath)}`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
