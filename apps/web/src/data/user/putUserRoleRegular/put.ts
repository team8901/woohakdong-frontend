import { API_URL } from '@/data/apiUrl';

export const putUserRoleRegular = async (): Promise<void> => {
  const response = await fetch(API_URL.COOKIE.USER_ROLE, {
    method: 'PUT',
  });

  if (!response.ok) {
    throw new Error('❌ 유저 권한(정회원) 등록 중 에러가 발생했습니다.');
  }
};
