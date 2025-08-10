Архив (неиспользуемый/устаревший код)

Отключены и перенесены логически (код в исходниках закомментирован, маршруты не активны):

Страницы
- app/catalog/new/page.tsx — дубль «Новинки»
- app/catalog/promotions/page.tsx — дубль «Акции»
- app/акции/page.tsx — дубль кириллического пути «Акции»
- app/новинки/page.tsx — дубль корневого пути «Новинки»
- app/все-категории/page.tsx — дубль корневого пути «Все категории»
- app/discount/PromotionsContent.tsx — устаревший контент акций

API
- app/api/products/promotions/route.ts — устаревший, используйте /api/products?type=discount
- app/api/products-simple/route.ts — устаревший
- app/api/products/new/route.ts — endpoint совместимости (307 → /api/products?type=new)

Примечание
- Канонические маршруты: /discount, /catalog/новинки, /catalog/все-категории.
- Вся выборка идёт через /api/products.
