module.exports = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    // Менее строгие правила для any в определенных случаях
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    // Менее строгие правила для React hooks
    'react-hooks/exhaustive-deps': 'warn',
    // Отключаем строгие правила для Next.js API routes
    '@next/next/no-assign-module-variable': 'off',
  },
  overrides: [
    {
      files: ['src/app/api/**/*.ts', 'src/lib/auth*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
