import { checkProfileAndRedirect } from '@/app/login/_helpers/utils/redirectPage';
import { usePostSocialLoginMutation } from '@/data/auth/postSocialLogin/query';
import { setAccessToken } from '@workspace/api/manageToken';
import { useRouter } from 'next/navigation';

/**
 * 소셜 로그인 성공/실패 처리를 담당하는 커스텀 훅
 * @returns 소셜 로그인 mutation 객체
 */
export const useAuthorizationFlow = () => {
  const router = useRouter();

  const authorizationMutation = usePostSocialLoginMutation({
    onSuccess: async (data) => {
      // 액세스 토큰 저장 (HttpOnly RefreshToken은 쿠키로 처리됨)
      setAccessToken(data.accessToken);

      console.log('✅ 액세스 토큰, 리프레쉬 토큰 발급 및 저장 성공');

      await checkProfileAndRedirect(router);
    },
  });

  return authorizationMutation;
};
