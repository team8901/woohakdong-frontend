import { type ClubMemberRole } from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/clubMemberRole';
import { API_URL } from '@/data/apiUrl';

type PostClubMemberRoleParams = {
  clubMemberRole: ClubMemberRole;
  clubMembershipId?: number;
};

export const postClubMemberRole = async ({
  clubMemberRole,
  clubMembershipId,
}: PostClubMemberRoleParams) => {
  const response = await fetch(API_URL.COOKIE.CLUB_MEMBER_ROLE, {
    method: 'POST',
    body: JSON.stringify({ clubMemberRole, clubMembershipId }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('❌ 동아리 멤버 권한 등록 중 에러가 발생했습니다.');
  }
};
