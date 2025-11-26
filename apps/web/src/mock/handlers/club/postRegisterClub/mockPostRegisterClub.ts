import { API_URL } from '@/data/apiUrl';
import { 동아리_등록_성공 } from '@/mock/handlers/club/postRegisterClub/mockData';
import type { ClubIdResponse } from '@workspace/api/generated';
import { type MockApiResponse } from '@workspace/msw/types';

export const mockPostRegisterClub = {
  url: API_URL.CLUB.REGISTER_CLUB,
  description: '동아리 등록',
  method: 'post',
  response: {
    동아리_등록_성공: {
      status: 200,
      delayTime: 2000,
      data: 동아리_등록_성공,
    },
    에러: {
      status: 500,
      delayTime: 2000,
      data: {
        errorCode: 500,
        errorMessage: '동아리 등록 실패',
      },
    },
  },
} satisfies MockApiResponse<'동아리_등록_성공' | '에러', ClubIdResponse>;
