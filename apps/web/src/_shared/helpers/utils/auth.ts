import { showToast } from '@/_shared/helpers/utils/showToast';
import { deleteClubMemberRole } from '@/data/user/deleteClubMemberRole/delete';
import { deleteUserRole } from '@/data/user/deleteUserRole/delete';
import { signOutWithGoogle } from '@workspace/firebase/auth';

export const logoutUser = async (): Promise<void> => {
  try {
    await signOutWithGoogle();
    await deleteUserRole();
    await deleteClubMemberRole();

    console.log('✅ 로그아웃 성공');

    window.location.reload();
  } catch (error) {
    console.error('🚨 로그아웃 실패:', error);

    showToast({
      message: '로그아웃에 실패했어요',
      type: 'error',
    });
  }
};
