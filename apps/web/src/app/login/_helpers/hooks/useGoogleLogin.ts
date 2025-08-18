import { useState } from 'react';

import { signInWithGoogle } from '@workspace/firebase/auth';
import { getFirebaseIdToken, signInWithGoogle } from '@workspace/firebase/auth';
import { getAuthSocialLogin } from '@/data/auth/getAuthSocialLogin/fetch';
import { setAuthToken } from '@workspace/api/axios';
import { getAuthTest } from '@/data/auth/getAuthTest/fetch';
import { storeAndSetTokens } from '../utils/tokenStorage';

export const useGoogleLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      // Firebase Google 로그인
      const userCredential = await signInWithGoogle();
      console.log(
        'Firebase Google 로그인 완료: ',
        userCredential.user.displayName,
        userCredential.user.email,
      );

      // AccessToken 및 RefreshToken 발급
      const firebaseIdToken = await getFirebaseIdToken();
      const { accessToken, refreshToken } = await getAuthSocialLogin({
        provider: 'google',
        providerAccessToken: firebaseIdToken,
      });
      console.log('AccessToken 및 RefreshToken 발급 완료');

      // 토큰 저장 및 axios 인스턴스 설정
      await storeAndSetTokens({ accessToken, refreshToken }, setAuthToken);
      console.log('토큰 저장 및 설정 완료');

      // 테스트 API 호출
      const testResponse = await getAuthTest();
      console.log('테스트 API 응답:', testResponse);
    } catch (err) {
      console.error('로그인 실패:\n', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithGoogle, isLoading };
};
