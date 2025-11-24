import { getMyProfile } from '@/data/user/getMyProfile/fetch';
import { postUserRoleAssociate } from '@/data/user/postUserRoleAssociate/post';
import { putUserRoleRegular } from '@/data/user/putUserRoleRegular/put';
import { isAxiosError } from '@workspace/api/axios';

/**
 * 사용자 프로필 정보를 확인하고 적절한 페이지로 리다이렉트하는 유틸리티 함수
 * @returns Promise<void>
 */
export const setUserRoleAndRefresh = async (): Promise<void> => {
  try {
    await getMyProfile();

    console.log('✅ 프로필 정보 조회 성공');

    // 유저 권한(정회원) 쿠키 설정
    await putUserRoleRegular();

    console.log('✅ 유저 권한(정회원) 쿠키 설정 완료');
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
