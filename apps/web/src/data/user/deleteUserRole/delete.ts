import { API_URL } from '@/data/apiUrl';

export const deleteUserRole = async (): Promise<void> => {
  const response = await fetch(API_URL.COOKIE.USER_ROLE, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('❌ 유저 권한 삭제 중 에러가 발생했습니다.');
  }
};
