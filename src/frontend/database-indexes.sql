-- Добавляем индексы для ускорения поиска и фильтрации
CREATE INDEX IF NOT EXISTS "Product_title_idx" ON "Product" ("title");
CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product" ("category");  
CREATE INDEX IF NOT EXISTS "Product_isConfirmed_idx" ON "Product" ("isConfirmed");
CREATE INDEX IF NOT EXISTS "Product_price_idx" ON "Product" ("price");
CREATE INDEX IF NOT EXISTS "Product_createdAt_idx" ON "Product" ("createdAt");
CREATE INDEX IF NOT EXISTS "Product_material_idx" ON "Product" ("material");
CREATE INDEX IF NOT EXISTS "Product_country_idx" ON "Product" ("country");

-- Составные индексы для частых запросов
CREATE INDEX IF NOT EXISTS "Product_confirmed_category_idx" ON "Product" ("isConfirmed", "category");
CREATE INDEX IF NOT EXISTS "Product_confirmed_title_idx" ON "Product" ("isConfirmed", "title");
CREATE INDEX IF NOT EXISTS "Product_confirmed_created_idx" ON "Product" ("isConfirmed", "createdAt");
