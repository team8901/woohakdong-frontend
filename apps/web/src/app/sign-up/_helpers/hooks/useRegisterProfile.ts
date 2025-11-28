import { putUserRoleRegular } from '@/data/user/putUserRoleRegular/put';
import { useCreateNewProfile } from '@workspace/api/generated';

export const useRegisterProfile = () => {
  const registerProfileMutation = useCreateNewProfile({
    mutation: {
      onSuccess: async (data) => {
        console.log('✅ 회원가입 완료', data);

        // 유저 권한(정회원) 쿠키 설정
        await putUserRoleRegular();

        window.location.reload();
      },
    },
  });

  return registerProfileMutation;
};
