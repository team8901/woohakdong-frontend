import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { savePreRegistrationInfo } from '@workspace/firebase/firestore';

import { type PreRegistrationInfoFormData } from '../types';
import { preRegistrationInfoSchema } from '../utils/zodSchemas';

type SubmitStatus = {
  type: 'success' | 'error';
  message: string;
} | null;

export const usePreRegistrationFlow = () => {
  const form = useForm<PreRegistrationInfoFormData>({
    resolver: zodResolver(preRegistrationInfoSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      schoolName: '',
      clubCategory: undefined,
    },
  });
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);

  const onSubmit = async (data: PreRegistrationInfoFormData): Promise<void> => {
    setSubmitStatus(null);

    try {
      await savePreRegistrationInfo(
        data.email,
        data.schoolName,
        data.clubCategory,
      );

      setSubmitStatus({
        type: 'success',
        message: '사전 등록이 완료되었어요!',
      });
      form.reset();
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했어요.',
      });
    }
  };

  const onQuit = async (): Promise<void> => {
    form.clearErrors();
    form.reset();
    setSubmitStatus(null);
  };

  return {
    form,
    onSubmit,
    onQuit,
    submitStatus,
    isFormValid: form.formState.isValid,
    isSubmitting: form.formState.isSubmitting,
  };
};
