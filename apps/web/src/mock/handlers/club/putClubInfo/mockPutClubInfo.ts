import { API_URL } from '@/data/apiUrl';
import { type MockApiResponse } from '@workspace/msw/types';

export const mockPutClubInfo = {
  url: API_URL.CLUB.UPDATE_CLUB_INFO,
  description: '동아리 정보 수정',
  method: 'put',
  response: {
    동아리_정보_수정_성공: {
      status: 200,
      delayTime: 1000,
      data: undefined,
    },
  },
} satisfies MockApiResponse<'동아리_정보_수정_성공', void>;
