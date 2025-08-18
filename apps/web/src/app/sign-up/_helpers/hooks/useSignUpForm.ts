import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../utils/zodSchemas';

type UseSignUpFormProps = {
  form: UseFormReturn<FormData>;
};

type UseSignUpFormReturn = {
  onQuit: () => Promise<void>;
  onSubmit: (data: FormData) => Promise<void>;
};

export const useSignUpForm = ({
  form,
}: UseSignUpFormProps): UseSignUpFormReturn => {
  const onQuit = async (): Promise<void> => {
    form.clearErrors();
    // TODO: 회원가입 취소 또는 로그아웃 로직
    console.log('회원가입 취소');
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    const userProfile = {
      nickname: data.nickname,
      phoneNumber: data.phoneNumber,
      studentId: data.studentId,
      gender: data.gender,
    };

    console.log('서버로 전송할 데이터:', userProfile);

    // TODO: 서버로 전송하는 부분 추가
  };

  return {
    onQuit,
    onSubmit,
  };
};
