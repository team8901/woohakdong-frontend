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
 * 서버 컴포넌트에서 API 호출 시 withServerCookies wrapper를 사용하여
 * 요청 컨텍스트 안에서 쿠키를 읽어 axios 헤더에 주입합니다.
 *
 * @example
 * ```tsx
 * // 서버 컴포넌트에서
 * import { cookies } from 'next/headers';
 * import { withServerCookies } from '@workspace/api';
 *
 * const data = await withServerCookies(cookies, () => getClubList());
 * ```
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/cookies
 */

type CookieStore = {
  get: (name: string) => { value: string } | undefined;
};

type CookiesFn = () => Promise<CookieStore>;

/**
 * 서버 환경 여부 확인
 */
export const isServer = typeof window === 'undefined';

/**
 * API 요청에 필요한 쿠키 이름 목록
 */
const REQUIRED_COOKIE_NAMES = ['accessToken', 'refreshToken'] as const;

/**
 * 쿠키 스토어에서 인증 쿠키를 읽어 Cookie 헤더 형식으로 반환
 */
const buildCookieHeader = (cookieStore: CookieStore): string | undefined => {
  const cookieParts: string[] = [];

  for (const name of REQUIRED_COOKIE_NAMES) {
    const cookie = cookieStore.get(name);

    if (cookie?.value) {
      cookieParts.push(`${name}=${cookie.value}`);
    }
  }

  return cookieParts.length > 0 ? cookieParts.join('; ') : undefined;
};

/**
 * 서버 컴포넌트에서 API 호출 시 쿠키를 자동으로 포함시키는 wrapper
 *
 * Next.js의 cookies() 함수는 서버 컴포넌트 컨텍스트 안에서만 호출할 수 있습니다.
 * 이 wrapper는 컨텍스트 안에서 쿠키를 읽어 axios 헤더에 주입한 후 API를 호출합니다.
 *
 * @param cookiesFn - next/headers의 cookies 함수
 * @param fn - API 호출 함수
 * @returns API 호출 결과
 *
 * @example
 * ```tsx
 * import { cookies } from 'next/headers';
 * import { withServerCookies, getClubList } from '@workspace/api';
 *
 * // 단일 API 호출
 * const clubs = await withServerCookies(cookies, () => getClubList());
 *
 * // 여러 API 호출
 * const data = await withServerCookies(cookies, async () => {
 *   const clubs = await getClubList();
 *   const members = await getMemberList();
 *   return { clubs, members };
 * });
 * ```
 */
export const withServerCookies = async <T>(
  cookiesFn: CookiesFn,
  fn: () => Promise<T>,
): Promise<T> => {
  // 순환 참조 방지를 위해 지연 로딩
  const { api } = await import('./axios');

  const cookieStore = await cookiesFn();
  const cookieHeader = buildCookieHeader(cookieStore);

  if (cookieHeader) {
    // axios 기본 헤더에 Cookie 설정
    api.defaults.headers.common['Cookie'] = cookieHeader;
  }

  try {
    return await fn();
  } finally {
    // API 호출 후 헤더 정리 (다른 요청에 영향 주지 않도록)
    delete api.defaults.headers.common['Cookie'];
  }
};
