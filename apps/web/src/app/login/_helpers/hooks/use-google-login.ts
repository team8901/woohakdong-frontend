'use client';

import { useState } from 'react';
import { signInWithGoogle } from '@workspace/firebase/auth';

const useGoogleLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      console.log('Google 로그인 성공');

      // TODO: 로그인 후 라우팅 추가
    } catch (err) {
      console.error('Google 로그인 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithGoogle, isLoading };
};

export default useGoogleLogin;
