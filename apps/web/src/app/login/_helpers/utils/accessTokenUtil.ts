import { clearAuthorization, setAuthorization } from '@workspace/api/axios';

const IS_BROWSER = typeof window !== 'undefined';

let inMemoryAccessToken: string | null = null;

/**
 * 액세스 토큰 설정 및 저장
 * - 브라우저 환경에서만 메모리에 저장합니다.
 * - axios Authorization 헤더도 함께 설정합니다.
 */
export const setAccessToken = (accessToken: string): void => {
  if (!accessToken || typeof accessToken !== 'string') return;

  if (IS_BROWSER) {
    inMemoryAccessToken = accessToken;
    setAuthorization(accessToken);
  }
};

/** 현재 메모리에 저장된 액세스 토큰을 반환 (SSR에서는 항상 null) */
export const getAccessToken = (): string | null => {
  if (!IS_BROWSER) return null;

  return inMemoryAccessToken;
};

/** 메모리의 액세스 토큰과 axios Authorization 헤더를 제거 */
export const clearAccessToken = (): void => {
  if (IS_BROWSER) {
    inMemoryAccessToken = null;
    clearAuthorization();
  }
};

/** 액세스 토큰 보유 여부 */
export const hasAccessToken = (): boolean => {
  return !!getAccessToken();
};
