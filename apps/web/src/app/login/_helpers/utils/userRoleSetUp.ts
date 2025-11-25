import { postClubMemberRole } from '@/data/user/postClubMemberRole/post';
import { postUserRoleAssociate } from '@/data/user/postUserRoleAssociate/post';
import { putUserRoleRegular } from '@/data/user/putUserRoleRegular/put';
import { isAxiosError } from '@workspace/api/axios';
import { getClubMembers, getMyProfile } from '@workspace/api/generated';

/**
 * 사용자 프로필 정보를 확인하고 적절한 페이지로 리다이렉트하는 유틸리티 함수
 * @returns Promise<void>
 */
export const setUserRoleAndRefresh = async (): Promise<void> => {
  try {
    const user = await getMyProfile();

    console.log('✅ 프로필 정보 조회 성공');

    // 유저 권한(정회원) 쿠키 설정
    await putUserRoleRegular();

    console.log('✅ 유저 권한(정회원) 쿠키 설정 완료');

    // TODO: clubId를 동적으로 가져와야 함
    const clubId = 1;
    const { data: members } = await getClubMembers(clubId);
    const clubMember = members?.find((member) => member.email === user.email);

    if (clubMember?.clubMemberRole) {
      await postClubMemberRole(clubMember.clubMemberRole);
      console.log('✅ 동아리 멤버 권한 쿠키 설정 완료');
    }
  } catch (err) {
    if (isAxiosError(err)) {
      if (err.response?.status === 404) {
        console.log('⚠️ 프로필 정보 없음');

        // 유저 권한(준회원) 쿠키 설정
        await postUserRoleAssociate();

        console.log('✅ 유저 권한(준회원) 쿠키 설정 완료');
      }
    } else {
      throw err;
    }
  } finally {
    // 쿠키 설정 후 페이지 리로드 (서버에서 설정한 httpOnly 쿠키가 반영되도록)
    window.location.reload();
  }
};
