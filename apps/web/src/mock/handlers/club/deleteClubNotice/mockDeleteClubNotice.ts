import { API_URL } from '@/data/apiUrl';
import { type MockApiResponse } from '@workspace/msw/types';

export const mockDeleteClubNotice = {
  url: API_URL.CLUB.CLUB_NOTICES_DETAIL,
  description: '동아리 공지사항 삭제',
  method: 'delete',
  response: {
    공지사항_삭제_성공: {
      status: 200,
      delayTime: 1000,
      data: undefined,
    },
    에러: {
      status: 500,
      delayTime: 1000,
      data: {
        errorCode: 500,
        errorMessage: '공지사항 삭제에 실패했습니다.',
      },
    },
  },
} satisfies MockApiResponse<'공지사항_삭제_성공' | '에러', void>;
