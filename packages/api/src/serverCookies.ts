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
 * axios 인터셉터에서 next/headers의 cookies()를 직접 호출하여
 * 필요한 쿠키만 읽어 Cookie 헤더로 전달합니다.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/cookies
 */

/**
 * 서버 환경 여부 확인
 */
export const isServer = typeof window === 'undefined';

/**
 * API 요청에 필요한 쿠키 이름 목록
 */
const REQUIRED_COOKIE_NAMES = ['accessToken', 'refreshToken'] as const;

/**
 * 서버 환경에서 인증 쿠키를 읽어 Cookie 헤더 형식으로 반환
 * axios 인터셉터에서 호출됩니다.
 *
 * @returns 쿠키 문자열 또는 undefined
 */
export const getServerCookies = async (): Promise<string | undefined> => {
  if (!isServer) {
    return undefined;
  }

  try {
    // 동적 import로 next/headers 로드 (서버 환경에서만 실행)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { cookies } = require('next/headers') as {
      cookies: () => Promise<{ get: (name: string) => { value: string } | undefined }>;
    };
    const cookieStore = await cookies();
    const cookieParts: string[] = [];

    for (const name of REQUIRED_COOKIE_NAMES) {
      const cookie = cookieStore.get(name);

      if (cookie?.value) {
        cookieParts.push(`${name}=${cookie.value}`);
      }
    }

    return cookieParts.length > 0 ? cookieParts.join('; ') : undefined;
  } catch {
    // cookies()가 서버 컴포넌트 컨텍스트 밖에서 호출되면 에러 발생
    return undefined;
  }
};
