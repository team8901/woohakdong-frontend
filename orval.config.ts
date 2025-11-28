import { defineConfig } from 'orval';

export default defineConfig({
  woohakdong: {
    input: {
      target: 'https://api.woohakdong.com/v3/api-docs',
    },
    output: {
      mode: 'tags-split',
      target: 'packages/api/src/generated',
      client: 'react-query',
      override: {
        mutator: {
          path: 'packages/api/src/axios.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useSuspenseQuery: true,
          useMutation: true,
          useInfinite: false,
          signal: true,
        },
      },
      fileExtension: '.ts',
      tsconfig: 'packages/api/tsconfig.json',
      prettier: true,
    },
  },
});
