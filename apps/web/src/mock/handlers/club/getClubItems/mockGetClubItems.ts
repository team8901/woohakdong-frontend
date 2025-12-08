import { API_URL } from '@/data/apiUrl';
import {
  동아리_물품_없음,
  동아리_물품_있음,
} from '@/mock/handlers/club/getClubItems/mockData';
import { type ListWrapperClubItemResponse } from '@workspace/api/generated';
import { type MockApiResponse } from '@workspace/msw/types';

export const mockGetClubItems = {
  url: API_URL.CLUB.CLUB_ITEMS,
  description: '동아리 물품 조회',
  method: 'get',
  response: {
    동아리_물품_없음: {
      status: 200,
      delayTime: 2000,
      data: 동아리_물품_없음,
    },
    동아리_물품_있음: {
      status: 200,
      delayTime: 2000,
      data: 동아리_물품_있음,
    },
    에러: {
      status: 400,
      delayTime: 2000,
      data: {
        errorCode: 400,
        errorMessage: '에러 메시지',
      },
    },
  },
} satisfies MockApiResponse<
  '동아리_물품_없음' | '동아리_물품_있음' | '에러',
  ListWrapperClubItemResponse
>;
