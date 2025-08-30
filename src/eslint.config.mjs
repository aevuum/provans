import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: [
      ".next/**",
      "out/**", 
      "dist/**",
      "build/**",
      "node_modules/**",
      ".env*",
      "**/api/auth/**"
    ]
  },

  // Загружаем конфиг Next.js
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Переопределяем правила — это важно: должно быть ПОСЛЕ compat.extends
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn", // или "off", если хочешь полностью отключить
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-assign-module-variable": "off"
    }
  },

  // Опционально: отключить any только в API и auth
  {
    files: ["app/api/**/*.ts", "lib/auth.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
];