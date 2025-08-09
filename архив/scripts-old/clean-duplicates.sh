#!/bin/bash

echo "🔍 Поиск дубликатов файлов..."

# Находим дубликаты в папке public
echo "📁 Проверяем папку public..."
find /Users/haibura/provans-decor/public -type f -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | sort

echo ""
echo "🧹 Удаляем дубликаты lock файлов..."

# Удаляем лишние lock файлы, оставляем только в корне проекта
if [ -f "/Users/haibura/package-lock.json" ]; then
    echo "Удаляем /Users/haibura/package-lock.json"
    rm -f "/Users/haibura/package-lock.json"
fi

echo "✅ Очистка завершена"
