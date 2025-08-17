import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../utils/zodSchemas';

type UseSignUpFormProps = {
  step: 1 | 2;
  setStep: (step: 1 | 2) => void;
  form: UseFormReturn<FormData>;
};

type UseSignUpFormReturn = {
  handleNextStep: () => Promise<void>;
  handlePreviousStep: () => Promise<void>;
  onSubmit: (data: FormData) => Promise<void>;
};

export const useSignUpForm = ({
  step,
  setStep,
  form,
}: UseSignUpFormProps): UseSignUpFormReturn => {
  const onSubmit = async (data: FormData): Promise<void> => {
    console.log('회원가입 최종 데이터', {
      ...data,
      phone: data.phone.replace(/\D/g, ''),
    });
    // TODO: 서버에 데이터 전송 API 연동
  };

  const handleNextStep = async (): Promise<void> => {
    if (step === 1) {
      const fieldsToValidate: (keyof FormData)[] = ['gender', 'phone'];
      const isValid = await form.trigger(fieldsToValidate);

      if (isValid) {
        form.clearErrors();
        setStep(2);
      }
    } else {
      await form.handleSubmit(onSubmit)();
    }
  };

  const handlePreviousStep = async (): Promise<void> => {
    if (step === 2) {
      setStep(1);
      form.clearErrors();
    } else {
      // TODO: 회원가입 취소 또는 로그아웃 로직
      console.log('회원가입 취소');
    }
  };

  return {
    handleNextStep,
    handlePreviousStep,
    onSubmit,
  };
};
