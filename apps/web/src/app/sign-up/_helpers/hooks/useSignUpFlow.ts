import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { type UserProfile, type UserProfileFormData } from '../types';
import { userProfileSchema } from '../utils/zodSchemas';
import { useRegisterProfile } from './useRegisterProfile';

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
      form.clearErrors();
      form.reset();
      // TODO: 회원가입 취소 또는 로그아웃 로직
    } catch (error) {
      console.error('🚨 로그아웃 중 오류 발생:', error);
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
