import { REFRESH_URL } from '@workspace/api/_helpers';
import { type AxiosInstance } from 'axios';

/**
 * Access Token 쿠키 관리
 *
 * 현재 구현: 일반 쿠키 (JavaScript 접근 가능)
 * - 서버/클라이언트 모두에서 접근 가능하여 서버 컴포넌트에서 API 호출 가능
 * - XSS 공격에 취약할 수 있으나, 짧은 만료 시간으로 리스크 완화
 *
 * TODO: 더 나은 보안을 위해 백엔드에서 HttpOnly 쿠키로 accessToken을 내려주도록 변경 고려
 * - HttpOnly 쿠키는 JavaScript로 접근 불가하여 XSS 공격 방지
 * - 백엔드 API 수정 및 프론트엔드 인터셉터 로직 변경 필요
 */

/**
 * 현재 저장된 Access Token을 반환합니다.
 * @returns Access Token 문자열 또는 null
 */
export const getAccessToken = async (): Promise<string | null> => {
  // 클라이언트 환경
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/accessToken=([^;]+)/);

    return match ? (match[1] ?? null) : null;
  }

  // 서버 환경 (Next.js 서버 컴포넌트)
  try {
    /**
     * 동적 import(require)를 사용하는 이유:
     * - next/headers는 서버 전용 모듈
     * - 정적 import 사용 시 클라이언트 번들에 포함되어 빌드 에러 발생
     * - 이 함수는 클라이언트/서버 모두에서 호출되므로 동적 로드 필요
     * - 서버에서 실행될 때만 런타임에 모듈을 로드
     */
    // eslint-disable-next-line
    const { cookies } = require('next/headers');
    const cookieStore = await cookies();

    return cookieStore.get('accessToken')?.value ?? null;
  } catch {
    // next/headers를 사용할 수 없는 환경 (빌드 타임 등)
    return null;
  }
};

/**
 * 새로운 Access Token을 저장합니다.
 * @param token 새로운 Access Token 또는 null
 */
export const setAccessToken = (token: string | null): void => {
  // 클라이언트 환경에서만 쿠키 설정 가능
  if (typeof window === 'undefined') return;

  if (token) {
    // 3600초 (1시간) 만료
    document.cookie = `accessToken=${token}; path=/; max-age=3600; SameSite=Strict`;
  } else {
    // 쿠키 삭제
    document.cookie = 'accessToken=; path=/; max-age=0';
  }
};

/**
 * 저장된 Access Token을 제거합니다.
 */
export const clearAccessToken = (): void => {
  setAccessToken(null);
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

    const { data } = await api.post<{ accessToken: string }>(REFRESH_URL);

    console.log('✨ Access Token 재발급 성공');

    const newAccessToken = data?.accessToken ?? null;

    setAccessToken(newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error('🔥 Access Token 재발급 실패', error);

    clearAccessToken();

    return null;
  }
};
