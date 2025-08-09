#!/bin/bash

# Скрипт для быстрого исправления authOptions проблем

echo "Исправляем импорты auth..."

# Находим все файлы с getServerSession и заменяем
find src/app/api -name "*.ts" -type f -exec sed -i '' '
s/import { getServerSession } from "next-auth\/next";/import { getAdminSession } from "@\/lib\/authUtils";/g
s/import { authOptions } from "@\/lib\/auth";//g
s/const session = await getServerSession(authOptions) as AuthSession | null;/const session = await getAdminSession();/g
/interface AuthSession {/,/}/d
' {} \;

echo "Готово!"
