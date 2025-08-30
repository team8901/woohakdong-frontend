import { useState } from 'react';

import { setAccessToken } from '@/app/login/_helpers/utils/accessTokenUtil';
import { getAuthTest } from '@/data/auth/getAuthTest/fetch';
import { usePostSocialLoginMutation } from '@/data/auth/postSocialLogin/query';
import { signInWithGoogle } from '@workspace/firebase/auth';

export const useGoogleLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const socialLoginMutation = usePostSocialLoginMutation({
    onSuccess: async (data) => {
      setAccessToken(data.accessToken);

      console.log('액세스 토큰 및 리프레쉬 토큰 발급 및 저장 성공');
    },
  });

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      const userCredential = await signInWithGoogle();
      const firebaseIdToken = await userCredential.user.getIdToken();

      console.log('Google 로그인 성공');

      await socialLoginMutation.mutateAsync({
        provider: 'google',
        providerAccessToken: firebaseIdToken,
      });

      const testDate = await getAuthTest();

      console.log('인증 테스트 성공', testDate);
    } catch (err) {
      console.error('Google 로그인 실패 또는 토큰 처리 중 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithGoogle, isLoading };
};
