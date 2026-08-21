import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier';
import vueParser from 'vue-eslint-parser';

export default defineConfig([
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/public/**'],
  },
  eslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  ...tseslint.configs['recommended'],
  {
    rules: {
      semi: 'error',
      'prefer-const': 'error',
    },
    files: ['**/*.vue', '**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  eslintConfigPrettier,
]);
