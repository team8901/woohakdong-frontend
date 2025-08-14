'use client';

import { Button } from '@workspace/ui/components/button';
import { Loader2Icon } from 'lucide-react';
import GoogleIcon from '@workspace/ui/icons/google-icon';
import { useGoogleLogin } from '../_helpers/hooks/useGoogleLogin';

export const GoogleLoginButtonClient = () => {
  const { loginWithGoogle, isLoading } = useGoogleLogin();

  return (
    <Button
      variant="outline"
      type="button"
      className="w-full"
      onClick={loginWithGoogle}
      disabled={isLoading}
      aria-busy={isLoading}>
      {isLoading ? (
        <>
          <Loader2Icon className="animate-spin" />
          <p>로그인 중...</p>
        </>
      ) : (
        <>
          <GoogleIcon />
          <p>Google로 시작하기</p>
        </>
      )}
    </Button>
  );
};
