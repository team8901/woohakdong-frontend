import { API_URL } from '@/data/apiUrl';
import {
  제출된_신청서_없음,
  제출된_신청서_있음,
} from '@/mock/handlers/club/getApplicationSubmissions/mockData';
import { type ListWrapperClubApplicationSubmissionResponse } from '@workspace/api/generated';
import { type MockApiResponse } from '@workspace/msw/types';

export const mockGetApplicationSubmissions = {
  url: API_URL.CLUB.APPLICATION_SUBMISSIONS,
  description: '제출된 동아리 신청서 목록 조회',
  method: 'get',
  response: {
    제출된_신청서_없음: {
      status: 200,
      delayTime: 500,
      data: 제출된_신청서_없음,
    },
    제출된_신청서_있음: {
      status: 200,
      delayTime: 500,
      data: 제출된_신청서_있음,
    },
    에러: {
      status: 400,
      delayTime: 500,
      data: {
        errorCode: 400,
        errorMessage: '제출된 신청서 목록을 불러오는데 실패했습니다.',
      },
    },
  },
} satisfies MockApiResponse<
  '제출된_신청서_없음' | '제출된_신청서_있음' | '에러',
  ListWrapperClubApplicationSubmissionResponse
>;
