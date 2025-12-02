import { type ApiResponse } from '@/_shared/helpers/types/apiResponse';
import { API_URL } from '@/data/apiUrl';
import {
  동아리_물품_대여_내역_없음,
  동아리_물품_대여_내역_있음,
} from '@/mock/handlers/club/getClubItemHistory/mockData';
import { type ClubItemHistoryResponse } from '@workspace/api/generated';
import { type MockApiResponse } from '@workspace/msw/types';

export const mockGetClubItemHistory = {
  url: API_URL.CLUB.CLUB_ITEM_HISTORY,
  description: '동아리 물품 대여 내역 조회',
  method: 'get',
  response: {
    동아리_물품_대여_내역_없음: {
      status: 200,
      delayTime: 2000,
      data: 동아리_물품_대여_내역_없음,
    },
    동아리_물품_대여_내역_있음: {
      status: 200,
      delayTime: 2000,
      data: 동아리_물품_대여_내역_있음,
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
  '동아리_물품_대여_내역_없음' | '동아리_물품_대여_내역_있음' | '에러',
  ApiResponse<ClubItemHistoryResponse[]>
>;
