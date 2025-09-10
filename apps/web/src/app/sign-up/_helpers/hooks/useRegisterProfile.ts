import { usePostRegisterMyProfileMutation } from '@/data/user/postRegisterMyProfile/query';
import { useRouter } from 'next/navigation';

export const useRegisterProfile = () => {
  const router = useRouter();

  const registerProfileMutation = usePostRegisterMyProfileMutation({
    onSuccess: (data) => {
      console.log('✅ 회원가입 완료', data);

      router.replace('/notice');
    },
  });

  return registerProfileMutation;
};
