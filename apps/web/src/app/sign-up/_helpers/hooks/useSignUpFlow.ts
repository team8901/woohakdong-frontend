import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { clearAccessToken } from '@workspace/api/manageToken';
import { signOutWithGoogle } from '@workspace/firebase/auth';

import { type UserProfileFormData } from '../types';
import { userProfileSchema } from '../utils/zodSchemas';
import { useRegisterProfile } from './useRegisterProfile';

type UserProfile = {
  nickname: string;
  phoneNumber: string;
  studentId: string;
  gender: 'MALE' | 'FEMALE';
};

export const useSignUpFlow = () => {
  const { mutateAsync: registerProfileMutation } = useRegisterProfile();

  const form = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    mode: 'onChange',
    defaultValues: {
      nickname: '',
      phoneNumber: '',
      studentId: '',
      gender: undefined,
    },
  });

  const onSubmit = async (data: UserProfileFormData): Promise<void> => {
    try {
      const userProfile: UserProfile = {
        nickname: data.nickname,
        phoneNumber: data.phoneNumber,
        studentId: data.studentId,
        gender: data.gender,
      };

      await registerProfileMutation(userProfile);
    } catch (error) {
      console.error('🚨 프로필 제출 중 오류 발생:', error);
      alert('프로필 완성 중에 오류가 발생했어요 🥲 다시 시도해주세요');
    }
  };

  const onQuit = async (): Promise<void> => {
    try {
      await fetch('/api/auth/roles', { method: 'DELETE' });
      await signOutWithGoogle();
      clearAccessToken();

      form.clearErrors();
      form.reset();

      console.log('✅ 로그아웃 성공');

      window.location.reload();
    } catch (error) {
      console.error('🚨 로그아웃 중 오류 발생:', error);
      alert('로그아웃 중에 오류가 발생했어요 🫠 다시 시도해주세요');
    }
  };

  return {
    form,
    onSubmit,
    onQuit,
    isFormValid: form.formState.isValid,
    isSubmitting: form.formState.isSubmitting,
  };
};
