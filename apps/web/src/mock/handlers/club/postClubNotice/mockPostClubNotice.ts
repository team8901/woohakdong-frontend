import { API_URL } from '@/data/apiUrl';
import { type NoticeIdResponse } from '@workspace/api/generated';
import { type MockApiResponse } from '@workspace/msw/types';

import { 공지사항_등록_성공 } from './mockData';

export const mockPostClubNotice = {
  url: API_URL.CLUB.CLUB_NOTICES,
  description: '동아리 공지사항 등록',
  method: 'post',
  response: {
    공지사항_등록_성공: {
      status: 200,
      delayTime: 1000,
      data: 공지사항_등록_성공,
    },
    에러: {
      status: 500,
      delayTime: 1000,
      data: {
        errorCode: 500,
        errorMessage: '공지사항 등록에 실패했습니다.',
      },
    },
  },
} satisfies MockApiResponse<'공지사항_등록_성공' | '에러', NoticeIdResponse>;
