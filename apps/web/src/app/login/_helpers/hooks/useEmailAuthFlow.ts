import { useState } from 'react';

import { showToast } from '@/_shared/helpers/utils/showToast';
import { useAuthorizationFlow } from '@/app/login/_helpers/hooks/useAuthorizationFlow';
import { signInWithEmailAndPassword } from '@workspace/firebase/auth';

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않아요',
  'auth/user-not-found': '등록되지 않은 이메일이에요',
  'auth/wrong-password': '비밀번호가 올바르지 않아요',
  'auth/invalid-email': '이메일 형식이 올바르지 않아요',
  'auth/user-disabled': '비활성화된 계정이에요',
  'auth/too-many-requests':
    '너무 많은 시도가 있었어요. 잠시 후 다시 시도해주세요',
  'auth/operation-not-allowed': '이메일/비밀번호 로그인이 활성화되지 않았어요',
};

/**
 * 이메일/비밀번호 로그인 처리를 담당하는 커스텀 훅
 * @returns 이메일 로그인 함수와 로딩 상태
 */
export const useEmailAuthFlow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: authorizationMutation } = useAuthorizationFlow();

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(email, password);
      const firebaseIdToken = await userCredential.user.getIdToken();

      console.log('✅ 이메일 로그인 성공');

      await authorizationMutation({
        data: {
          provider: 'email-password',
          providerAccessToken: firebaseIdToken,
        },
      });
    } catch (err) {
      console.error('🚨 이메일 로그인 실패:', err);

      const errorCode = (err as { code?: string })?.code;
      const message =
        FIREBASE_ERROR_MESSAGES[errorCode ?? ''] ??
        `로그인 실패: ${errorCode || '알 수 없는 오류'}`;

      showToast({
        message,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithEmail, isLoading };
};
