import { nextJsConfig } from '@workspace/eslint-config/next-js';
// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    files: ['**/*.stories.@(js|jsx|ts|tsx)'],
    plugins: {
      storybook,
    },
    rules: {
      ...storybook.configs.recommended.rules,
    },
  },
];
