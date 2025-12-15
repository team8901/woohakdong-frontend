import { API_URL } from '@/data/apiUrl';
import { 신청서_제출_성공 } from '@/mock/handlers/club/postApplicationSubmission/mockData';
import { type ClubApplicationSubmissionIdResponse } from '@workspace/api/generated';
import { type MockApiResponse } from '@workspace/msw/types';

export const mockPostApplicationSubmission = {
  url: API_URL.CLUB.APPLICATION_SUBMISSIONS,
  description: '동아리 신청서 제출',
  method: 'post',
  response: {
    성공: {
      status: 200,
      delayTime: 500,
      data: 신청서_제출_성공,
    },
    에러: {
      status: 400,
      delayTime: 500,
      data: {
        errorCode: 400,
        errorMessage: '신청서 제출에 실패했습니다.',
      },
    },
  },
} satisfies MockApiResponse<'성공' | '에러', ClubApplicationSubmissionIdResponse>;
