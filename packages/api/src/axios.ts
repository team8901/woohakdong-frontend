import { setupInterceptors } from '@workspace/api/interceptors';
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  isAxiosError,
} from 'axios';

const isServer = typeof window === 'undefined';

export const getBaseURL = () =>
  (isServer
    ? process.env.API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL) || '/api';

export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

setupInterceptors(api);

/**
 * Orval mutator - 생성된 API 클라이언트에서 사용할 커스텀 axios 인스턴스
 * 인터셉터가 설정된 api 인스턴스를 사용하여 모든 API 호출에 인증 토큰이 자동으로 포함됩니다.
 */
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return api.request<T>(config).then((response) => response.data);
};

export { isAxiosError };
export type { AxiosError, AxiosRequestConfig, AxiosResponse };
