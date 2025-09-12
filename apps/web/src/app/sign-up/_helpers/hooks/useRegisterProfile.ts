import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { usePostRegisterProfileMutation } from '@/data/user/postRegisterProfile/mutation';
import { useRouter } from 'next/navigation';

export const useRegisterProfile = () => {
  const router = useRouter();

  const registerProfileMutation = usePostRegisterProfileMutation({
    onSuccess: (data) => {
      console.log('✅ 회원가입 완료', data);

      router.replace(APP_PATH.DASHBOARD.NOTICE);
    },
  });

  return registerProfileMutation;
};
