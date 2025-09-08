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

export { isAxiosError };
export type { AxiosError, AxiosRequestConfig, AxiosResponse };
