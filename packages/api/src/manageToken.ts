import { REFRESH_URL } from '@workspace/api/_helpers';
import { type AxiosInstance } from 'axios';

/**
 * Access Token을 재발급하는 함수
 * @param api Axios 인스턴스
 */
export const refreshAccessToken = async (api: AxiosInstance): Promise<void> => {
  try {
    console.log('🔄 Access Token 재발급 시도');

    await api.post(REFRESH_URL);

    console.log('✅ Access Token 재발급 성공');
  } catch (error) {
    console.error('🔥 Access Token 재발급 실패', error);

    throw error;
  }
};
