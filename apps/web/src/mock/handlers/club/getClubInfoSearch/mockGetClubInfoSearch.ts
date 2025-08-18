import { API_URL } from '@/data/apiUrl';
import { ClubInfoSearchResponse } from '@/data/club/getClubInfoSearch/type';
import {
  동아리_정보_없음,
  동아리_정보_있음,
} from '@/mock/handlers/club/getClubInfoSearch/mockData';
import { MockApiResponse } from '@workspace/msw/types';

export const mockGetClubInfoSearch = {
  url: API_URL.CLUB.CLUB_INFO_SEARCH,
  description: '동아리 정보 검색',
  method: 'get',
  response: {
    동아리_정보_없음: {
      status: 200,
      delayTime: 2000,
      data: 동아리_정보_없음,
    },
    동아리_정보_있음: {
      status: 200,
      delayTime: 2000,
      data: 동아리_정보_있음,
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
  '동아리_정보_없음' | '동아리_정보_있음' | '에러',
  ClubInfoSearchResponse
>;
