import { API_URL } from '@/data/apiUrl';
import { type NoticeResponse } from '@workspace/api/generated';
import { type MockApiResponse } from '@workspace/msw/types';

import {
  동아리_공지사항_단건_없음,
  동아리_공지사항_단건_있음,
} from './mockData';

export const mockGetClubNotice = {
  url: API_URL.CLUB.CLUB_NOTICES_DETAIL,
  description: '동아리 공지 단건 조회',
  method: 'get',
  response: {
    동아리_공지사항_단건_없음: {
      status: 200,
      delayTime: 2000,
      data: 동아리_공지사항_단건_없음,
    },
    동아리_공지사항_단건_있음: {
      status: 200,
      delayTime: 2000,
      data: 동아리_공지사항_단건_있음,
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
  '동아리_공지사항_단건_없음' | '동아리_공지사항_단건_있음' | '에러',
  NoticeResponse
>;
