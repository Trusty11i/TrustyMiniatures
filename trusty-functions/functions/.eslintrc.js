// eslint.config.js
import { defineConfig } from 'eslint';

export default defineConfig({
  extends: ['eslint:recommended', 'plugin:node/recommended'],
  env: {
    browser: true,
    node: true,
  },
  rules: {
    'no-unused-vars': 'warn',
    'indent': ['error', 2],  // Устанавливаем 2 пробела для отступов
    'comma-dangle': ['error', 'always-multiline'],
    'no-trailing-spaces': 'error',
    'quotes': ['error', 'double'],
  },
});
