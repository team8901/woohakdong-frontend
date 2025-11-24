import { usePostRegisterProfileMutation } from '@/data/user/postRegisterProfile/mutation';
import { putUserRoleRegular } from '@/data/user/putUserRoleRegular/put';

export const useRegisterProfile = () => {
  const registerProfileMutation = usePostRegisterProfileMutation({
    onSuccess: async (data) => {
      console.log('✅ 회원가입 완료', data);

      // 유저 권한(정회원) 쿠키 설정
      await putUserRoleRegular();

      window.location.reload();
    },
  });

  return registerProfileMutation;
};
