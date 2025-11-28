import { API_URL } from '@/data/apiUrl';
import { 내_정보 } from '@/mock/handlers/user-profile/getMyProfile/mockData';
import type { UserProfileResponse } from '@workspace/api/generated';
import { type MockApiResponse } from '@workspace/msw/types';

export const mockGetMyProfile = {
  url: API_URL.USER.MY_PROFILE,
  description: '내 정보 조회',
  method: 'get',
  response: {
    내_정보: {
      status: 200,
      delayTime: 1500,
      data: 내_정보,
    },
  },
} satisfies MockApiResponse<'내_정보', UserProfileResponse>;
