import { IS_MOCK } from '@/mock/config/env';

export async function register() {
  /**
   * 서버 컴포넌트나 api 라우트 등이 node.js 환경에서 실행될 때에만 처리
   * @see https://nextjs.org/docs/app/guides/instrumentation#importing-runtime-specific-code
   */
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (IS_MOCK) {
      const { mockServerListen } = await import('./mock/server');

      mockServerListen();
    }
  }
}
