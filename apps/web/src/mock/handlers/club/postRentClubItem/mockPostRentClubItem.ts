import { API_URL } from '@/data/apiUrl';
import { type ClubItemRentResponse } from '@workspace/api/generated';
import { type MockApiResponse } from '@workspace/msw/types';

import { 물품_대여_성공 } from './mockData';

export const mockPostRentClubItem = {
  url: API_URL.CLUB.CLUB_ITEM_RENT,
  description: '동아리 물품 대여',
  method: 'post',
  response: {
    물품_대여_성공: {
      status: 200,
      delayTime: 1000,
      data: 물품_대여_성공,
    },
    에러: {
      status: 400,
      delayTime: 1000,
      data: {
        errorCode: 400,
        errorMessage: '물품 대여에 실패했습니다.',
      },
    },
  },
} satisfies MockApiResponse<'물품_대여_성공' | '에러', ClubItemRentResponse>;
