import { type ClubMemberRole } from '@/app/(dashboard)/member/_helpers/constants/clubMemberRole';

export const postClubMemberRole = async (clubMemberRole: ClubMemberRole) => {
  const response = await fetch('/api/auth/club-roles', {
    method: 'POST',
    body: JSON.stringify({ clubMemberRole }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('❌ 동아리 멤버 권한 등록 중 에러가 발생했습니다.');
  }
};
