import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

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
});

api.interceptors.request.use(
  (config) => {
    // TODO: 요청 인터셉터 로직 추가
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // TODO: 응답 인터셉터 로직 추가
    return Promise.reject(error);
  },
);

/**
 * 공용 axios 인스턴스에 Bearer 토큰을 Authorization 헤더에 설정
 * @param token 액세스 토큰 (JWT)
 */
export const setAuthToken = (token: string) => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

/**
 * 공용 axios 인스턴스에서 Authorization 헤더 제거
 */
export const deleteAuthToken = () => {
  delete api.defaults.headers.common.Authorization;
};

export type { AxiosError, AxiosRequestConfig, AxiosResponse };
