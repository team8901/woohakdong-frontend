import { captureAxiosError } from '@workspace/sentry/captureAxiosError';
import {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { REFRESH_URL } from './_helpers/constants';
import { refreshAccessToken } from './manageToken';

const isServer = typeof window === 'undefined';

/**
 * Axios 인터셉터 설정
 *
 * ## 쿠키 전달 방식
 * - CSR: withCredentials: true로 브라우저가 자동으로 쿠키 포함
 * - SSR: next/headers의 cookies()를 통해 쿠키를 읽어 헤더에 주입
 *
 * ## 개발 환경
 * 환경변수로 쿠키를 주입할 수 있습니다.
 * - SSR: DEV_SERVER_COOKIES (Cookie 헤더)
 * - CSR: NEXT_PUBLIC_DEV_ACCESS_TOKEN (Authorization 헤더)
 *
 * @param api Axios 인스턴스
 */
export const setupInterceptors = (api: AxiosInstance): void => {
  /**
   * Request 인터셉터 - 쿠키 주입
   */
  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // 개발 환경: 환경변수로 쿠키 주입
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

      // SSR: next/headers에서 쿠키 읽어서 헤더에 추가
      if (isServer) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { cookies } = require('next/headers') as {
            cookies: () => Promise<{
              get: (name: string) => { value: string } | undefined;
            }>;
          };
          const cookieStore = await cookies();
          const accessToken = cookieStore.get('accessToken')?.value;
          const refreshToken = cookieStore.get('refreshToken')?.value;

          console.log('SSR 쿠키 주입:', { accessToken, refreshToken });

          const cookieParts: string[] = [];

          if (accessToken) cookieParts.push(`accessToken=${accessToken}`);

          if (refreshToken) cookieParts.push(`refreshToken=${refreshToken}`);

          if (cookieParts.length > 0) {
            config.headers.set('Cookie', cookieParts.join('; '));
          }
        } catch {
          // cookies()가 서버 컴포넌트 컨텍스트 밖에서 호출되면 에러 발생
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
