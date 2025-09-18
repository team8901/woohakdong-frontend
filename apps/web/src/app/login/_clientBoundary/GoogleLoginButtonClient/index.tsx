'use client';

import { trackEvent } from '@/eventTracker/trackEvent';
import { Button } from '@workspace/ui/components/button';
import { GoogleIcon } from '@workspace/ui/icons/google-icon';
import { Loader2Icon } from 'lucide-react';

import { useGoogleAuthFlow } from '../../_helpers/hooks/useGoogleAuthFlow';

export const GoogleLoginButtonClient = () => {
  const { loginWithGoogle, isLoading } = useGoogleAuthFlow();

  const handleButtonClick = () => {
    // TODO: user_type 같은 공통 프로퍼티는 자동 수집되도록 하기
    trackEvent('google_login_click', {
      user_type: 'unknown',
    });

    loginWithGoogle();
  };

  return (
    <Button
      variant="outline"
      type="button"
      className="w-full"
      onClick={handleButtonClick}
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
