/**
 * @workspace/api
 * API 클라이언트 및 유틸리티
 */

// Export axios instance and utilities
export { api, customInstance, getBaseURL, isAxiosError } from './axios';
export type { AxiosError, AxiosRequestConfig, AxiosResponse } from './axios';

// Export token management
export { refreshAccessToken } from './manageToken';

// Export server-side cookie utilities
export { withServerCookies, isServer } from './serverCookies';

// Export auto-generated API clients and types
export * from './generated';
