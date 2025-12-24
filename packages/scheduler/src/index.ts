/**
 * Cloudflare Workers 정기결제 스케줄러
 *
 * Cron 스케줄:
 * - 매일 오전 9시 (KST): 구독 갱신 결제
 * - 매일 오후 2시 (KST): 결제 실패 재시도
 * - 매주 월요일 오전 3시 (KST): 만료 구독 정리
 *
 * @see https://developers.cloudflare.com/workers/
 * @see https://developers.portone.io/
 */

import {
  cleanupExpiredSubscriptions,
  processCanceledSubscriptions,
  processSubscriptionRenewals,
  retryFailedPayments,
} from './subscription';
import type { Env } from './types';

export type { Env } from './types';

export default {
  /**
   * Cron Trigger 핸들러
   */
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    // 테스트 빌링 주기가 설정된 경우: 매분 모든 작업 실행
    if (env.TEST_BILLING_CYCLE_MINUTES) {
      console.log(
        `Test billing cycle mode (${env.TEST_BILLING_CYCLE_MINUTES}min): running all scheduled tasks`,
      );
      ctx.waitUntil(
        Promise.all([
          processSubscriptionRenewals(env),
          processCanceledSubscriptions(env),
          retryFailedPayments(env),
        ]),
      );

      return;
    }

    // 일반 모드: 특정 시간에만 실행
    const hour = new Date(event.scheduledTime).getUTCHours();
    const dayOfWeek = new Date(event.scheduledTime).getUTCDay();

    // UTC 0시 = KST 9시: 구독 갱신 + 취소된 구독 만료 처리
    if (hour === 0) {
      ctx.waitUntil(
        Promise.all([
          processSubscriptionRenewals(env),
          processCanceledSubscriptions(env),
        ]),
      );
    }
    // UTC 5시 = KST 14시: 결제 실패 재시도
    else if (hour === 5) {
      ctx.waitUntil(retryFailedPayments(env));
    }
    // UTC 일요일 18시 = KST 월요일 3시: 만료 구독 정리
    else if (hour === 18 && dayOfWeek === 0) {
      ctx.waitUntil(cleanupExpiredSubscriptions(env));
    }
  },

  /**
   * HTTP 요청 핸들러 (테스트/수동 실행용)
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 헬스체크는 인증 불필요
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    // 테스트 엔드포인트 보안 검증
    const isTestEndpoint = url.pathname.startsWith('/test/');

    if (isTestEndpoint) {
      // 프로덕션 환경에서는 테스트 엔드포인트 비활성화
      if (env.ENVIRONMENT === 'production') {
        return new Response('Forbidden', { status: 403 });
      }

      // API 키가 설정된 경우 인증 필요
      if (env.SCHEDULER_API_KEY) {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response('Unauthorized', { status: 401 });
        }

        const providedKey = authHeader.slice(7);

        if (providedKey !== env.SCHEDULER_API_KEY) {
          return new Response('Unauthorized', { status: 401 });
        }
      }
    }

    if (url.pathname === '/test/renewals') {
      await processSubscriptionRenewals(env);

      return new Response('Renewal process completed', { status: 200 });
    }

    if (url.pathname === '/test/canceled') {
      await processCanceledSubscriptions(env);

      return new Response('Canceled subscription process completed', {
        status: 200,
      });
    }

    if (url.pathname === '/test/retry') {
      await retryFailedPayments(env);

      return new Response('Retry process completed', { status: 200 });
    }

    if (url.pathname === '/test/cleanup') {
      await cleanupExpiredSubscriptions(env);

      return new Response('Cleanup process completed', { status: 200 });
    }

    return new Response('Not Found', { status: 404 });
  },
};
