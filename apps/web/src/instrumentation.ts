import { IS_MOCK } from '@/mock/config/env';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (IS_MOCK) {
      const { mockServerListen } = await import('./mock/server');

      mockServerListen();
    }
  }
}
