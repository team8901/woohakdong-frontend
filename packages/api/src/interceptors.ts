import { captureAxiosError } from '@workspace/sentry/captureAxiosError';
import {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { REFRESH_URL } from './_helpers/constants';
import { refreshAccessToken } from './manageToken';
import { getServerCookies, isServer } from './serverCookies';

/**
 * Axios 인터셉터 설정
 *
 * ## 서버 사이드 쿠키 전달
 * 서버 컴포넌트에서 API 호출 시, 브라우저 쿠키가 자동으로 전달되지 않습니다.
 * Request 인터셉터에서 AsyncLocalStorage에 저장된 쿠키를 헤더에 포함시킵니다.
 *
 * @param api Axios 인스턴스
 * @see https://nextjs.org/docs/app/api-reference/functions/cookies
 */
export const setupInterceptors = (api: AxiosInstance): void => {
  /**
   * Request 인터셉터 - 서버 사이드 쿠키 주입
   *
   * 클라이언트에서는 withCredentials: true로 브라우저가 자동으로 쿠키를 포함하지만,
   * 서버(Node.js)에서는 브라우저 컨텍스트가 없으므로 명시적으로 쿠키를 헤더에 추가해야 합니다.
   *
   * @see https://jools.dev/sending-cookies-with-nextjs-and-axios
   */
  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      /**
       * 개발 환경에서는 환경변수에 설정된 토큰을 주입
       * - SSR: DEV_SERVER_COOKIES (Cookie 헤더)
       * - CSR: NEXT_PUBLIC_DEV_ACCESS_TOKEN (Authorization 헤더)
       *
       * CSR에서는 브라우저 보안 정책으로 Cookie 헤더를 직접 설정할 수 없으므로
       * Authorization 헤더를 사용합니다.
       */
      if (process.env.NODE_ENV === 'development') {
        if (isServer) {
          const devCookies = process.env.DEV_SERVER_COOKIES;

          if (devCookies) {
            config.headers.set('Cookie', devCookies);

            return config;
          }
        } else {
          const devAccessToken = process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN;

          if (devAccessToken) {
            config.headers.set('Authorization', `Bearer ${devAccessToken}`);

            return config;
          }
        }
      }

      // 프로덕션: 서버 환경에서만 쿠키 주입 (클라이언트는 withCredentials로 처리)
      if (isServer) {
        const cookies = await getServerCookies();

        if (cookies) {
          config.headers.set('Cookie', cookies);
        }
      }

      return config;
    },
    (error: AxiosError) => Promise.reject(error),
  );

  // Response 인터셉터(API 에러 센트리 캡쳐)
  api.interceptors.response.use(undefined, captureAxiosError);

  // 동시 401 발생 시 단일 리프레시 호출을 공유하기 위한 Promise
  let refreshTokenPromise: Promise<void> | null = null;

  // Response 인터셉터(액세스토큰 재발급 처리)
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & { _retry?: boolean })
        | undefined;
      const status = error.response?.status;

      // 원본 요청 정보가 없거나 401이 아닌 경우 그대로 에러 반환
      if (!originalRequest || status !== 401) {
        return Promise.reject(error);
      }

      // 리프레시 엔드포인트 자체가 401 이면 로그인 페이지로 이동
      const isRefreshCall =
        typeof originalRequest.url === 'string' &&
        originalRequest.url.includes(REFRESH_URL);

      if (isRefreshCall) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }

      // 이미 한 번 재시도한 요청은 더 이상 진행하지 않음 (무한 루프 방지)
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // 진행 중인 리프레시가 없으면 시작, 있으면 대기
      if (!refreshTokenPromise) {
        refreshTokenPromise = refreshAccessToken(api).finally(() => {
          // 완료 후 다음 401을 위해 초기화
          refreshTokenPromise = null;
        });
      }

      await refreshTokenPromise;

      // 원 요청을 그대로 재시도 (쿠키에 새 토큰이 포함되어 있음)
      return api.request(originalRequest);
    },
  );
};
