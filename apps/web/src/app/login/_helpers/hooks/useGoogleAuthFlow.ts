import { useState } from 'react';

import { useAuthorizationFlow } from '@/app/login/_helpers/hooks/useAuthorizationFlow';
import { signInWithGoogle } from '@workspace/firebase/auth';

/**
 * Google 로그인 성공/실패 처리를 담당하는 커스텀 훅
 * @returns Google 로그인 함수와 로딩 상태
 */
export const useGoogleAuthFlow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const authorizationMutation = useAuthorizationFlow();

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      const userCredential = await signInWithGoogle();
      const firebaseIdToken = await userCredential.user.getIdToken();

      console.log('✅ Google 로그인 성공');

      await authorizationMutation.mutateAsync({
        provider: 'google',
        providerAccessToken: firebaseIdToken,
      });
    } catch (err) {
      console.error('🚨 Google 로그인 실패 또는 토큰 처리 중 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithGoogle, isLoading };
};
