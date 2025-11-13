export const putUserRoleRegular = async (): Promise<void> => {
  const response = await fetch('/api/auth/roles', {
    method: 'PUT',
  });

  if (!response.ok) {
    throw new Error('❌ 유저 권한(정회원) 등록 중 에러가 발생했습니다.');
  }
};
