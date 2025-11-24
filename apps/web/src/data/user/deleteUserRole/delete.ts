export const deleteUserRole = async (): Promise<void> => {
  const response = await fetch('/api/auth/roles', {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('❌ 유저 권한 삭제 중 에러가 발생했습니다.');
  }
};
