import { API_URL } from '@/data/apiUrl';
import {
  신청폼_없음,
  신청폼_있음,
} from '@/mock/handlers/club/getApplicationForms/mockData';
import { type ListWrapperClubApplicationFormInfoResponse } from '@workspace/api/generated';
import { type MockApiResponse } from '@workspace/msw/types';

export const mockGetApplicationForms = {
  url: API_URL.CLUB.APPLICATION_FORMS,
  description: '동아리 신청폼 목록 조회',
  method: 'get',
  response: {
    신청폼_없음: {
      status: 200,
      delayTime: 500,
      data: 신청폼_없음,
    },
    신청폼_있음: {
      status: 200,
      delayTime: 500,
      data: 신청폼_있음,
    },
    에러: {
      status: 400,
      delayTime: 500,
      data: {
        errorCode: 400,
        errorMessage: '신청폼 목록을 불러오는데 실패했습니다.',
      },
    },
  },
} satisfies MockApiResponse<
  '신청폼_없음' | '신청폼_있음' | '에러',
  ListWrapperClubApplicationFormInfoResponse
>;
