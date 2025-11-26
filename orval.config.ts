import { defineConfig } from 'orval';

export default defineConfig({
  woohakdong: {
    input: {
      target: 'https://api.woohakdong.com/v3/api-docs',
    },
    output: {
      mode: 'tags-split',
      target: 'packages/api/src/generated',
      client: 'axios-functions',
      override: {
        mutator: {
          path: 'packages/api/src/axios.ts',
          name: 'customInstance',
        },
      },
      fileExtension: '.ts',
      tsconfig: 'packages/api/tsconfig.json',
      prettier: true,
    },
  },
});
