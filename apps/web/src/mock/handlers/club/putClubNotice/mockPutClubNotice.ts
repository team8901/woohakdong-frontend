import { API_URL } from '@/data/apiUrl';
import { type MockApiResponse } from '@workspace/msw/types';

export const mockPutClubNotice = {
  url: API_URL.CLUB.CLUB_NOTICES_DETAIL,
  description: '동아리 공지사항 수정',
  method: 'put',
  response: {
    공지사항_수정_성공: {
      status: 200,
      delayTime: 1000,
      data: undefined,
    },
    에러: {
      status: 500,
      delayTime: 1000,
      data: {
        errorCode: 500,
        errorMessage: '공지사항 수정에 실패했습니다.',
      },
    },
  },
} satisfies MockApiResponse<'공지사항_수정_성공' | '에러', void>;
