import { usePostRegisterMyProfileMutation } from '@/data/user/postRegisterMyProfile/query';
import router from 'next/router';

export const useRegisterProfile = () => {
  const registerProfileMutation = usePostRegisterMyProfileMutation({
    onSuccess: (data) => {
      console.log('✅ 회원가입 완료', data);

      router.replace('/notice');
    },
  });

  return registerProfileMutation;
};
