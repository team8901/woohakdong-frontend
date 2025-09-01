import { getMyProfile } from '@/data/user/getMyProfile/fetch';
import { isAxiosError } from '@workspace/api/axios';
import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * 사용자 프로필 정보를 확인하고 적절한 페이지로 리다이렉트하는 유틸리티 함수
 *
 * @param router - Next.js router 인스턴스
 * @returns Promise<void>
 */
export const checkProfileAndRedirect = async (
  router: AppRouterInstance,
): Promise<void> => {
  try {
    await getMyProfile();

    console.log('✅ 프로필 정보 조회 성공');

    router.replace('/notice');
  } catch (err) {
    if (isAxiosError(err)) {
      if (err.response?.status === 404) {
        console.log('⚠️ 프로필 정보 없음');

        router.replace('/sign-up');
      }
    } else {
      throw err;
    }
  }
};
