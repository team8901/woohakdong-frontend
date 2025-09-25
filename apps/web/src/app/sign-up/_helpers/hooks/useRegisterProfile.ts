import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { usePostRegisterProfileMutation } from '@/data/user/postRegisterProfile/mutation';
import { useRouter } from 'next/navigation';

export const useRegisterProfile = () => {
  const router = useRouter();

  const registerProfileMutation = usePostRegisterProfileMutation({
    onSuccess: async (data) => {
      console.log('✅ 회원가입 완료', data);

      // 유저 권한(정회원) 쿠키 설정
      try {
        await fetch('/api/auth/roles', {
          method: 'PUT',
        });
      } catch (error) {
        console.error(
          '❌ 유저 권한(정회원) 등록 중 에러가 발생했습니다.',
          error,
        );
      }

      router.replace(APP_PATH.DASHBOARD.NOTICE);
    },
  });

  return registerProfileMutation;
};
