import { type http } from 'msw';

type HttpMethod = keyof typeof http;

type StatusCode = 200 | 400 | 401 | 403 | 500;
type SuccessStatusCode = Extract<StatusCode, 200>;
type ErrorStatusCode = Exclude<StatusCode, 200>;

type ErrorData = {
  errorCode: number;
  errorMessage: string;
};

/**
 * 목데이터의 개별 응답 type
 * 1. 요청 성공한 경우 (success status), data 타입은 ResponseData
 * 2. 요청 실패한 경우 (error status), data 타입은 ErrorData
 */
type ResponseItem<ResponseData> =
  | {
      status: SuccessStatusCode;
      delayTime: number;
      data: ResponseData;
    }
  | {
      status: ErrorStatusCode;
      delayTime: number;
      data: ErrorData;
    };

/**
 * 목데이터의 전체 api 응답 type
 */
export type MockApiResponse<Key extends string, ResponseData> = {
  url: string;
  description: string;
  method: HttpMethod;
  response: Record<Key, ResponseItem<ResponseData>>;
};
