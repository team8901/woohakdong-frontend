import type { StorybookConfig } from '@storybook/nextjs-vite';
import { dirname, join, resolve } from 'path';
import { mergeConfig } from 'vitest/config.js';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-vitest'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/nextjs-vite'),
    options: {},
  },
  staticDirs: ['../public'],
  viteFinal: async (config) => {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@workspace/ui': resolve(__dirname, '../../../packages/ui/src'),
        },
      },
    });
  },
};

export default config;
