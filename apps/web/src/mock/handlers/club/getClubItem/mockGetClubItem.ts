import { API_URL } from '@/data/apiUrl';
import { type ClubItemDetailResponse } from '@workspace/api/generated';
import { type MockApiResponse } from '@workspace/msw/types';

import { 동아리_물품_상세_대여중 } from './mockData';

export const mockGetClubItem = {
  url: API_URL.CLUB.CLUB_ITEM_DETAIL,
  description: '동아리 물품 상세 조회',
  method: 'get',
  response: {
    동아리_물품_상세_대여중: {
      status: 200,
      delayTime: 500,
      data: 동아리_물품_상세_대여중,
    },
  },
} satisfies MockApiResponse<'동아리_물품_상세_대여중', ClubItemDetailResponse>;
