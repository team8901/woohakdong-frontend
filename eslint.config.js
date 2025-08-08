import { config as baseConfig } from '@workspace/eslint-config/base';

// This configuration only applies to the package manager root.
/** @type {import("eslint").Linter.Config} */
export default [
  ...baseConfig,
  {
    ignores: ['apps/**', 'packages/**'],
  },
];
