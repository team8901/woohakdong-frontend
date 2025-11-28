import { API_URL } from '@/data/apiUrl';
import { 내가_가입한_동아리_목록 } from '@/mock/handlers/club/getJoinedClubs/mockData';
import type { ListWrapperClubInfoResponse } from '@workspace/api/generated';
import { type MockApiResponse } from '@workspace/msw/types';

export const mockGetJoinedClubs = {
  url: API_URL.CLUB.GET_JOINED_CLUBS,
  description: '내가 가입한 동아리 목록 조회',
  method: 'get',
  response: {
    내가_가입한_동아리_목록: {
      status: 200,
      delayTime: 1000,
      data: 내가_가입한_동아리_목록,
    },
  },
} satisfies MockApiResponse<
  '내가_가입한_동아리_목록',
  ListWrapperClubInfoResponse
>;
