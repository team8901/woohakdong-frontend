import { API_URL } from '@/data/apiUrl';
import { 신청폼_생성_성공 } from '@/mock/handlers/club/postApplicationForm/mockData';
import { type ClubApplicationFormIdResponse } from '@workspace/api/generated';
import { type MockApiResponse } from '@workspace/msw/types';

export const mockPostApplicationForm = {
  url: API_URL.CLUB.APPLICATION_FORMS,
  description: '동아리 신청폼 생성',
  method: 'post',
  response: {
    성공: {
      status: 200,
      delayTime: 500,
      data: 신청폼_생성_성공,
    },
    에러: {
      status: 400,
      delayTime: 500,
      data: {
        errorCode: 400,
        errorMessage: '신청폼 생성에 실패했습니다.',
      },
    },
  },
} satisfies MockApiResponse<'성공' | '에러', ClubApplicationFormIdResponse>;
