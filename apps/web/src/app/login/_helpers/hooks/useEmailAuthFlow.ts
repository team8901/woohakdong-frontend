import { useState } from 'react';

import { showToast } from '@/_shared/helpers/utils/showToast';
import { useAuthorizationFlow } from '@/app/login/_helpers/hooks/useAuthorizationFlow';
import { signInWithEmailAndPassword } from '@workspace/firebase/auth';

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

      // Firebase 에러 코드에 따른 메시지
      const errorCode = (err as { code?: string })?.code;
      let message = '로그인에 실패했어요';

      switch (errorCode) {
        case 'auth/invalid-credential':
          message = '이메일 또는 비밀번호가 올바르지 않아요';
          break;
        case 'auth/user-not-found':
          message = '등록되지 않은 이메일이에요';
          break;
        case 'auth/wrong-password':
          message = '비밀번호가 올바르지 않아요';
          break;
        case 'auth/invalid-email':
          message = '이메일 형식이 올바르지 않아요';
          break;
        case 'auth/user-disabled':
          message = '비활성화된 계정이에요';
          break;
        case 'auth/too-many-requests':
          message = '너무 많은 시도가 있었어요. 잠시 후 다시 시도해주세요';
          break;
        case 'auth/operation-not-allowed':
          message = '이메일/비밀번호 로그인이 활성화되지 않았어요';
          break;

        default:
          message = `로그인 실패: ${errorCode || '알 수 없는 오류'}`;
      }

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
