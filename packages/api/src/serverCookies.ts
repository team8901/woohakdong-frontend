/**
 * 서버 사이드에서 쿠키를 axios 헤더에 포함시키기 위한 유틸리티
 *
 * ## 문제 배경
 * Next.js App Router의 서버 컴포넌트에서 axios로 API를 호출할 때,
 * 브라우저 쿠키가 자동으로 전달되지 않습니다.
 * - 클라이언트: 브라우저가 자동으로 쿠키를 포함 (withCredentials: true)
 * - 서버: Node.js 환경이므로 브라우저 쿠키에 접근 불가
 *
 * ## 해결 방법
 * 미들웨어에서 쿠키를 읽어 커스텀 헤더(x-auth-cookies)로 전달하고,
 * 서버 컴포넌트에서 headers() 함수로 이 헤더를 읽어 axios에 주입합니다.
 *
 * ## 왜 미들웨어를 사용하는가?
 * - 미들웨어는 모든 요청에서 실행되며, request.cookies에 접근 가능
 * - 서버 컴포넌트보다 먼저 실행되므로 헤더 설정이 보장됨
 * - headers() 함수는 서버 컴포넌트에서 안정적으로 동작
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/headers
 */

type HeadersFn = () => Promise<{ get: (name: string) => string | null }>;

/**
 * Next.js headers() 함수의 참조를 저장하는 전역 변수
 */
let headersFnRef: HeadersFn | null = null;

/**
 * 서버 환경 여부 확인
 */
export const isServer = typeof window === 'undefined';

/**
 * 현재 요청 컨텍스트의 인증 쿠키 문자열을 반환
 * axios 인터셉터에서 호출됩니다.
 *
 * 미들웨어에서 설정한 x-auth-cookies 헤더를 읽어 반환합니다.
 *
 * @returns 쿠키 문자열 또는 undefined (클라이언트 환경이거나 초기화 전)
 */
export const getServerCookies = async (): Promise<string | undefined> => {
  // 개발 환경에서 DEV_SERVER_COOKIES 환경변수가 설정되어 있으면 우선 사용
  const devCookies = process.env.DEV_SERVER_COOKIES;

  if (process.env.NODE_ENV === 'development' && devCookies) {
    return devCookies;
  }

  if (!headersFnRef) {
    return undefined;
  }

  try {
    const headersStore = await headersFnRef();
    const authCookies = headersStore.get('x-auth-cookies');

    return authCookies || undefined;
  } catch {
    // headers()가 서버 컴포넌트 컨텍스트 밖에서 호출되면 에러 발생
    return undefined;
  }
};

/**
 * Next.js의 headers 함수를 등록합니다.
 * 앱의 루트 레이아웃에서 한 번만 호출하면 됩니다.
 *
 * @param headersFn - next/headers의 headers 함수
 *
 * @example
 * ```tsx
 * // layout.tsx
 * import { initServerHeaders } from '@workspace/api';
 * import { headers } from 'next/headers';
 *
 * // 모듈 레벨에서 한 번만 초기화
 * initServerHeaders(headers);
 *
 * export default function RootLayout({ children }) {
 *   return <html><body>{children}</body></html>;
 * }
 * ```
 */
export const initServerHeaders = (headersFn: HeadersFn): void => {
  headersFnRef = headersFn;
};

/**
 * @deprecated Use initServerHeaders instead
 */
export const initServerCookies = initServerHeaders;
