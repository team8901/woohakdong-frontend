import { checkProfileAndRedirect } from '@/app/login/_helpers/utils/redirectPage';
import { usePostSocialLoginMutation } from '@/data/auth/postSocialLogin/query';
import { setAccessToken } from '@workspace/api/manageToken';
import { useRouter } from 'next/navigation';

/**
 * 소셜 로그인 성공 시 액세스 토큰, 리프레쉬 토큰을 발급하고 저장하는 커스텀 훅
 * @returns 토큰 저장 mutation 객체
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
