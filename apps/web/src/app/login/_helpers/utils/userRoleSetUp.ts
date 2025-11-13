import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { getMyProfile } from '@/data/user/getMyProfile/fetch';
import { isAxiosError } from '@workspace/api/axios';
import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * 사용자 프로필 정보를 확인하고 적절한 페이지로 리다이렉트하는 유틸리티 함수
 * @returns Promise<void>
 */

export const setUserRoleAndRefresh = async (
  router: AppRouterInstance,
): Promise<void> => {
  try {
    await getMyProfile();

    console.log('✅ 프로필 정보 조회 성공 - 정회원');

    // 유저 권한(정회원) 쿠키 설정
    try {
      await fetch('/api/auth/roles', {
        method: 'PUT',
      });

      console.log('✅ 유저 권한(정회원) 쿠키 설정 완료');
    } catch (error) {
      console.error('❌ 유저 권한(정회원) 등록 중 에러가 발생했습니다.', error);
    }

    router.replace(APP_PATH.DASHBOARD.NOTICE);
  } catch (err) {
    if (isAxiosError(err)) {
      if (err.response?.status === 404) {
        console.log('⚠️ 프로필 정보 없음 - 준회원');

        // 유저 권한(준회원) 쿠키 설정
        try {
          await fetch('/api/auth/roles', {
            method: 'POST',
          });

          console.log('✅ 유저 권한(준회원) 쿠키 설정 완료');
        } catch (error) {
          console.error(
            '❌ 유저 권한(준회원) 등록 중 에러가 발생했습니다.',
            error,
          );
        }

        router.replace(APP_PATH.SIGN_UP);
      }
    } else {
      throw err;
    }
  } finally {
    // 쿠키 설정 후 페이지 리로드 (서버에서 설정한 httpOnly 쿠키가 반영되도록)
    // 25.11.13 당시 리프레쉬 토큰 오류가 있어서 액세스토큰이 사라지는 것을 막기 위해 새로고침을 주석처리하고, router로 이동하게 해놨습니다.
    // window.location.reload();
  }
};
