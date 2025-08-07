import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "scripts/**/*",
      "*.js",
      "!src/**/*.js",
      "!src/**/*.jsx", 
      "!src/**/*.ts",
      "!src/**/*.tsx",
      "next.config.js",
      "next.config.ts",
      "tailwind.config.js",
      "postcss.config.js",
      ".next/**/*",
      "dist/**/*",
      "build/**/*",
      "node_modules/**/*"
    ]
  }
];

export default eslintConfig;
