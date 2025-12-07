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
 * 전역 변수에 cookies 함수 참조를 저장하고,
 * axios 인터셉터에서 이를 호출하여 쿠키를 헤더에 포함시킵니다.
 *
 * ## 왜 전역 변수를 사용하는가?
 * Next.js의 `cookies()` 함수는 `next/headers`에서 가져와야 하는데,
 * 이 모듈은 Next.js 앱 컨텍스트에서만 사용 가능합니다.
 * packages/api는 독립적인 패키지이므로 직접 import할 수 없어서,
 * 앱에서 함수 참조를 주입받는 방식을 사용합니다.
 *
 * ## 동시 요청 시 쿠키 혼선 문제는 없는가?
 * Next.js의 `cookies()` 함수는 내부적으로 AsyncLocalStorage를 사용하여
 * 각 요청 컨텍스트에 맞는 쿠키를 반환합니다.
 * 따라서 전역 변수에 함수 참조를 저장해도, 호출 시점에 올바른 쿠키가 반환됩니다.
 *
 * ## 대안 비교
 *
 * ### 1. API Route를 프록시로 사용 (선택하지 않음)
 * - 장점: 클라이언트/서버 코드 통일 가능
 * - 단점: 추가 네트워크 홉, 복잡성 증가, 모든 API를 래핑해야 함
 *
 * ### 2. 미들웨어에서 헤더 주입 (선택하지 않음)
 * - 장점: 중앙 집중식 관리
 * - 단점: 미들웨어는 Edge Runtime으로 제약이 많음, axios 인스턴스에 접근 불가
 *
 * ### 3. 전역 함수 참조 주입 (현재 방식)
 * - 장점: 간단하고 직관적, Next.js 내부 AsyncLocalStorage 활용
 * - 단점: 앱 시작 시 초기화 필요
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/cookies
 * @see https://jonmeyers.io/blog/forwarding-cookies-from-server-components-to-route-handlers-with-next-js-app-router
 */

type CookieStore = {
  toString: () => string;
};

type CookiesFn = () => Promise<CookieStore>;

/**
 * Next.js cookies() 함수의 참조를 저장하는 전역 변수
 *
 * 전역 변수를 사용해도 안전한 이유:
 * - cookies() 함수 자체가 AsyncLocalStorage 기반으로 요청별 컨텍스트를 관리
 * - 우리는 함수 "참조"만 저장하고, 실제 쿠키 값은 호출 시점에 결정됨
 */
let cookiesFnRef: CookiesFn | null = null;

/**
 * 현재 요청 컨텍스트의 쿠키 문자열을 반환
 * axios 인터셉터에서 호출됩니다.
 *
 * 개발 환경에서는 환경변수 DEV_SERVER_COOKIES를 우선 사용합니다.
 * .env.local에 다음과 같이 설정하세요:
 * ```
 * DEV_SERVER_COOKIES="accessToken=eyJ...; refreshToken=eyJ..."
 * ```
 *
 * @returns 쿠키 문자열 또는 undefined (클라이언트 환경이거나 초기화 전)
 */
/**
 * API 요청에 필요한 쿠키 이름 목록
 * 다른 쿠키(Amplitude, Supabase 등)는 제외하고 인증에 필요한 쿠키만 전달합니다.
 */
const REQUIRED_COOKIE_NAMES = ['accessToken', 'refreshToken'];

/**
 * 쿠키 문자열에서 필요한 쿠키만 필터링합니다.
 */
const filterCookies = (cookieString: string): string => {
  return cookieString
    .split(';')
    .map((cookie) => cookie.trim())
    .filter((cookie) => {
      const name = cookie.split('=')[0] ?? '';

      return REQUIRED_COOKIE_NAMES.includes(name);
    })
    .join('; ');
};

export const getServerCookies = async (): Promise<string | undefined> => {
  // 개발 환경에서 DEV_SERVER_COOKIES 환경변수가 설정되어 있으면 우선 사용
  const devCookies = process.env.DEV_SERVER_COOKIES;

  if (process.env.NODE_ENV === 'development' && devCookies) {
    return devCookies;
  }

  if (!cookiesFnRef) {
    return undefined;
  }

  try {
    const cookieStore = await cookiesFnRef();
    const allCookies = cookieStore.toString();

    console.log('[getServerCookies] all cookies:', allCookies);

    const filteredCookies = filterCookies(allCookies);

    console.log('[getServerCookies] filtered cookies:', filteredCookies);

    return filteredCookies || undefined;
  } catch {
    // cookies()가 서버 컴포넌트 컨텍스트 밖에서 호출되면 에러 발생
    return undefined;
  }
};

/**
 * Next.js의 cookies 함수를 등록합니다.
 * 앱의 루트 레이아웃에서 한 번만 호출하면 됩니다.
 *
 * @param cookiesFn - next/headers의 cookies 함수
 *
 * @example
 * ```tsx
 * // layout.tsx
 * import { initServerCookies } from '@workspace/api';
 * import { cookies } from 'next/headers';
 *
 * // 모듈 레벨에서 한 번만 초기화
 * initServerCookies(cookies);
 *
 * export default function RootLayout({ children }) {
 *   return <html><body>{children}</body></html>;
 * }
 * ```
 */
export const initServerCookies = (cookiesFn: CookiesFn): void => {
  console.log('[initServerCookies] registering cookies function');
  cookiesFnRef = cookiesFn;
};

/**
 * 서버 환경 여부 확인
 */
export const isServer = typeof window === 'undefined';
