import { type AxiosInstance } from 'axios';

let accessToken: string | null = null;

/**
 * 현재 저장된 Access Token을 반환합니다.
 * @returns Access Token 문자열 또는 null
 */
export const getAccessToken = (): string | null => {
  return accessToken;
};

/**
 * 새로운 Access Token을 저장합니다.
 * @param token 새로운 Access Token 또는 null
 */
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

/**
 * 저장된 Access Token을 제거합니다.
 */
export const clearAccessToken = (): void => {
  accessToken = null;
};

/**
 * Access Token을 재발급하는 함수
 * @param api Axios 인스턴스
 * @returns 새로운 Access Token 또는 null
 */
export const refreshAccessToken = async (
  api: AxiosInstance,
): Promise<string | null> => {
  try {
    console.log('🔄 Access Token 재발급 시도');

    const { data } = await api.post<{ accessToken: string }>(
      '/api/auth/refresh',
    );

    console.log('✨ Access Token 재발급 성공');

    const newAccessToken = data?.accessToken ?? null;

    setAccessToken(newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error('🔥 Access Token 재발급 실패', error);

    setAccessToken(null);

    return null;
  }
};
