import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import onlyWarn from 'eslint-plugin-only-warn';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

// A shared ESLint configuration for the repository.
/** @type {import("eslint").Linter.Config} */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
  {
    plugins: {
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: [
            './tsconfig.json',
            './packages/*/tsconfig.json',
            './apps/*/tsconfig.json',
          ],
        },
      },
    },
    rules: {
      // Import 관련 규칙들
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',
      'import/no-unused-modules': 'warn',
      'import/newline-after-import': ['error', { count: 1 }],

      // Simple import sort (더 강력한 import 정렬)
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000.*'], // Side effects
            ['^(?=react)'], // React
            ['^(?=[@\\w])'], // External libraries
            ['^(?=\\.)'], // Relative imports
            ['.*\\.(png|webp|jpg|jpeg|svg|lottie|mp4|wav)$'], // Assets
          ],
        },
      ],

      // 사용하지 않는 변수 처리 (언더스코어로 시작하는 변수 무시)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_$',
          caughtErrorsIgnorePattern: '^_$',
        },
      ],

      // Type import 명시적 사용
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

      // 개행 규칙
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
        { blankLine: 'any', prev: 'case', next: 'case' },
        { blankLine: 'any', prev: 'directive', next: 'directive' },
        { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
        { blankLine: 'any', prev: 'expression', next: 'expression' },
        { blankLine: 'any', prev: 'export', next: 'export' },
        { blankLine: 'any', prev: '*', next: 'break' },
      ],
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: [
      'dist/**',
      '.next/**',
      'node_modules/**',
      '*.min.js',
      'build/**',
      'out/**',
    ],
  },
];
