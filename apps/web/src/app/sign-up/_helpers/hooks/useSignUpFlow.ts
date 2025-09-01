import { useForm, type UseFormReturn } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { type UserProfile, type UserProfileFormData } from '../types';
import { userProfileSchema } from '../utils/zodSchemas';
import { useRegisterProfile } from './useRegisterProfile';

export const useSignUpFlow = (): {
  form: UseFormReturn<UserProfileFormData>;
  isFormValid: boolean;
  isSubmitting: boolean;
  onSubmit: (data: UserProfileFormData) => Promise<void>;
  onQuit: () => Promise<void>;
} => {
  const registerProfileMutation = useRegisterProfile();

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

      await registerProfileMutation.mutateAsync(userProfile);
    } catch (error) {
      console.error('🚨 프로필 제출 중 오류 발생:', error);
      // TODO: 에러 토스트 표시
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
