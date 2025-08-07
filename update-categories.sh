#!/bin/bash

# Маппинг названий папок на русские названия категорий и типы фильтров
declare -A CATEGORIES
CATEGORIES["home-sprays"]="Спреи для дома|category"
CATEGORIES["candle-holders"]="Подсвечники|category"
CATEGORIES["jewelry-boxes"]="Шкатулки|category"
CATEGORIES["garlands"]="Гирлянды|category"
CATEGORIES["table-serving"]="Сервировка стола|category"
CATEGORIES["easter"]="Пасхальный декор|category"
CATEGORIES["towels"]="Полотенца|category"
CATEGORIES["christmas-trees"]="Новогодние елки|category"
CATEGORIES["easter-decor"]="Пасхальные украшения|category"
CATEGORIES["small-items"]="Мелочи для дома|category"
CATEGORIES["aromatic-bouquets"]="Ароматические букеты|category"
CATEGORIES["pillows"]="Подушки|category"
CATEGORIES["christmas-balls"]="Новогодние шары|category"
CATEGORIES["scents"]="Ароматы|category"
CATEGORIES["flower-compositions"]="Цветочные композиции|category"
CATEGORIES["clocks"]="Часы|category"
CATEGORIES["allshop"]="Все товары|custom"
CATEGORIES["newyear"]="Новый год|category"
CATEGORIES["blankets"]="Одеяла|category"
CATEGORIES["diffusers"]="Диффузоры|category"
CATEGORIES["pannels"]="Панно|category"
CATEGORIES["christmas-figures"]="Новогодние фигурки|category"
CATEGORIES["christmas-branches"]="Новогодние ветки|category"
CATEGORIES["planters"]="Кашпо и горшки|category"
CATEGORIES["photoframes"]="Фоторамки|category"
CATEGORIES["glasses"]="Стаканы|category"
CATEGORIES["mirrors"]="Зеркала|category"
CATEGORIES["bookends"]="Держатели для книг|category"
CATEGORIES["christmas-toys"]="Новогодние игрушки|category"
CATEGORIES["napkins"]="Салфетки|category"
CATEGORIES["cutlery"]="Столовые приборы|category"
CATEGORIES["bedding"]="Постельное белье|category"
CATEGORIES["plates"]="Тарелки|category"
CATEGORIES["tablecloths"]="Скатерти|category" 
CATEGORIES["aromatic-candles"]="Ароматические свечи|category"
CATEGORIES["christmas-decor"]="Новогодний декор|category"
CATEGORIES["interior-items"]="Предметы интерьера|category"
CATEGORIES["garden-decor"]="Садовый декор|category"
CATEGORIES["cosmetic-bags"]="Косметички|category"
CATEGORIES["fragrances"]="Ароматы|category"
CATEGORIES["boxes"]="Коробки|category"

echo "Updating category pages..."

for category in "${!CATEGORIES[@]}"; do
    IFS='|' read -r display_name filter_type <<< "${CATEGORIES[$category]}"
    
    file_path="src/app/catalog/$category/page.tsx"
    
    if [[ -f "$file_path" ]]; then
        echo "Updating $file_path with category: $category, display: $display_name, type: $filter_type"
        
        # Создаем содержимое файла
        if [[ "$filter_type" == "custom" && "$category" == "allshop" ]]; then
            cat > "$file_path" << EOF
import CategoryPage from '@/app/components/CategoryPage';

export default function AllShopPage() {
  return (
    <CategoryPage 
      categoryName="все товары"
      displayName="Все товары"
      filterType="custom"
      customFilter={(products) => products}
    />
  );
}
EOF
        else
            # Преобразуем название категории
            category_name="$category"
            if [[ "$category" == "candle-holders" ]]; then
                category_name="подсвечники"
            elif [[ "$category" == "jewelry-boxes" ]]; then
                category_name="шкатулки"
            elif [[ "$category" == "photoframes" ]]; then
                category_name="фоторамки"
            elif [[ "$category" == "christmas-decor" ]]; then
                category_name="новый год"
            elif [[ "$category" == "newyear" ]]; then
                category_name="новый год"
            elif [[ "$category" == "aromatic-candles" ]]; then
                category_name="ароматы"
            elif [[ "$category" == "fragrances" ]]; then
                category_name="ароматы"
            fi
            
            # Создаем компонент название из category
            component_name=$(echo "$category" | sed 's/-/ /g' | sed 's/\b\w/\U&/g' | sed 's/ //g')Page
            
            cat > "$file_path" << EOF
import CategoryPage from '@/app/components/CategoryPage';

export default function ${component_name}() {
  return (
    <CategoryPage 
      categoryName="$category_name"
      displayName="$display_name"
      filterType="$filter_type"
    />
  );
}
EOF
        fi
    else
        echo "File $file_path not found"
    fi
done

echo "Category pages update completed!"
