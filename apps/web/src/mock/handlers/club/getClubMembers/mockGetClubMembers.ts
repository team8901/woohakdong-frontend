import { API_URL } from '@/data/apiUrl';
import { 동아리_회원_목록 } from '@/mock/handlers/club/getClubMembers/mockData';
import type { ListWrapperClubMembershipResponse } from '@workspace/api/generated';
import { type MockApiResponse } from '@workspace/msw/types';

export const mockGetClubMembers = {
  url: API_URL.CLUB.CLUB_MEMBERS,
  description: '동아리 회원 조회',
  method: 'get',
  response: {
    동아리_회원_목록: {
      status: 200,
      delayTime: 2000,
      data: 동아리_회원_목록,
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
  '동아리_회원_목록' | '에러',
  ListWrapperClubMembershipResponse
>;
