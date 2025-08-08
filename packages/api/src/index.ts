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
  // withCredentials: true,
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

export function setAuthToken(token?: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export type { AxiosError, AxiosRequestConfig, AxiosResponse };
