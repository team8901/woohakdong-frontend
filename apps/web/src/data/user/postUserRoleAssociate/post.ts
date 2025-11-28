import { API_URL } from '@/data/apiUrl';

export const postUserRoleAssociate = async (): Promise<void> => {
  const response = await fetch(API_URL.COOKIE.USER_ROLE, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('❌ 유저 권한(준회원) 등록 중 에러가 발생했습니다.');
  }
};
