import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.astro/**',
      'dist/**',
      '.cache/**',
      '.agents/**',
      'coverage/**',
      'reports/**',
      'playwright-report/**',
      'test-results/**',
      'AROMAFIA*.html',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.tsx'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/data/**', '**/repositories/**', '**/*.server', '**/*.server.*'],
              message: 'No importar datos privados ni módulos servidor en islas React.',
            },
          ],
        },
      ],
    },
  },
  { files: ['**/*.mjs'], rules: { '@typescript-eslint/no-require-imports': 'off' } },
  prettier,
);
