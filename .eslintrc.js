// This configuration only applies to the package manager root.
/** @type {import("eslint").Linter.Config} */
module.exports = {
  ignorePatterns: ['apps/**', 'packages/**'],
  extends: ['@workspace/eslint-config/library.js'],
  rules: {
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

    // Import 정렬
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
  },
};
