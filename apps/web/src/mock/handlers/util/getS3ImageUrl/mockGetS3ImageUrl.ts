import { API_URL } from '@/data/apiUrl';
import { type S3ImageUrlResponse } from '@/data/util/getS3ImageUrl/type';
import { URL_얻어오기_성공 } from '@/mock/handlers/util/getS3ImageUrl/mockData';
import { type MockApiResponse } from '@workspace/msw/types';

export const mockGetS3ImageUrl = {
  url: API_URL.UTIL.PRESIGNED_URL,
  description: 'S3 이미지 URL 얻어오기',
  method: 'get',
  response: {
    URL_얻어오기_성공: {
      status: 200,
      delayTime: 2000,
      data: URL_얻어오기_성공,
    },
    에러: {
      status: 500,
      delayTime: 2000,
      data: {
        errorCode: 500,
        errorMessage: 'URL 얻어오기 실패',
      },
    },
  },
} satisfies MockApiResponse<'URL_얻어오기_성공' | '에러', S3ImageUrlResponse>;
