import { postClubMemberRole } from '@/data/user/postClubMemberRole/post';
import { getClubMembers, getMyProfile } from '@workspace/api/generated';

import { getClubIdByEnglishName } from './getClubIdByEnglishName';

export const setClubMemberRole = async (
  clubEnglishName: string,
): Promise<void> => {
  try {
    const [user, clubId] = await Promise.all([
      getMyProfile(),
      getClubIdByEnglishName(clubEnglishName),
    ]);

    if (!clubId) {
      console.error('동아리를 찾을 수 없습니다.');

      return;
    }

    const { data: members } = await getClubMembers(clubId);
    const clubMember = members?.find((member) => member.email === user.email);

    if (clubMember?.clubMemberRole) {
      await postClubMemberRole(clubMember.clubMemberRole);
      console.log(
        '✅ 동아리 멤버 권한 쿠키 설정 완료:',
        clubMember.clubMemberRole,
      );
    }
  } catch (error) {
    console.error('동아리 멤버 권한 설정 실패:', error);
  }
};
