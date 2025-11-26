export const deleteClubMemberRole = async (): Promise<void> => {
  const response = await fetch('/api/auth/club-roles', {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('❌ 동아리 멤버 권한 삭제 중 에러가 발생했습니다.');
  }
};
