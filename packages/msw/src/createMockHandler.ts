import { getBaseURL } from '@workspace/api/axios';
import { delay, http, HttpResponse, type JsonBodyType } from 'msw';

import { type MockApiResponse } from './types.js';

/**
 * 특정 목데이터와 response key 를 받아서 MSW 핸들러를 생성하는 함수
 * @param mock - MockApiResponse 타입의 목데이터
 * @param key - 목데이터의 response key (여러 개면 하나를 선택)
 * @returns MSW 핸들러 (예: `http.get('/user', resolver)`)
 */
export const createMockHandler = <
  Key extends string,
  ResponseData extends JsonBodyType,
  T extends MockApiResponse<Key, ResponseData>,
  K extends keyof T['response'],
>(
  mock: T,
  key: K,
) => {
  const { status, delayTime, data } = mock.response[key];

  return http[mock.method](`${getBaseURL()}${mock.url}`, async () => {
    await delay(delayTime);

    return HttpResponse.json(data, {
      status,
    });
  });
};
