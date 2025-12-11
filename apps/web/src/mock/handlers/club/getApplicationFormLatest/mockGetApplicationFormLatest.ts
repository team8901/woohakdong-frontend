import { API_URL } from '@/data/apiUrl';
import { 최신_신청폼 } from '@/mock/handlers/club/getApplicationFormLatest/mockData';
import { type ClubApplicationFormInfoResponse } from '@workspace/api/generated';
import { type MockApiResponse } from '@workspace/msw/types';

export const mockGetApplicationFormLatest = {
  url: API_URL.CLUB.APPLICATION_FORM_LATEST,
  description: '최신 동아리 신청폼 조회',
  method: 'get',
  response: {
    성공: {
      status: 200,
      delayTime: 500,
      data: 최신_신청폼,
    },
    에러: {
      status: 400,
      delayTime: 500,
      data: {
        errorCode: 400,
        errorMessage: '현재 모집 중인 신청서가 없습니다.',
      },
    },
  },
} satisfies MockApiResponse<'성공' | '에러', ClubApplicationFormInfoResponse>;
