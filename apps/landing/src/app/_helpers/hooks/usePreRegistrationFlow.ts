import { useState } from 'react';

import { savePreRegistrationEmail } from '@workspace/firebase/firestore';

type SubmitStatus = {
  type: 'success' | 'error';
  message: string;
} | null;

export const usePreRegistrationFlow = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await savePreRegistrationEmail(email);

      setSubmitStatus({
        type: 'success',
        message: '사전 등록이 완료되었어요!',
      });
      setEmail('');
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했어요.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setSubmitStatus(null);
  };

  return {
    email,
    setEmail,
    isSubmitting,
    submitStatus,
    submitEmail,
    resetForm,
  };
};
