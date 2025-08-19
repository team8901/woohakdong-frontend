import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../utils/zodSchemas';

type UseSignUpFormProps = {
  form: UseFormReturn<FormData>;
};

type UseSignUpFormReturn = {
  onQuit: () => Promise<void>;
  onSubmit: (data: FormData) => Promise<void>;
};

type UserProfile = {
  nickname: string;
  phoneNumber: string;
  studentId: string;
  gender: 'MALE' | 'FEMALE';
};

export const useSignUpForm = ({
  form,
}: UseSignUpFormProps): UseSignUpFormReturn => {
  const onQuit = async (): Promise<void> => {
    try {
      form.clearErrors();
      form.reset();
      // TODO: 회원가입 취소 또는 로그아웃 로직
      console.log('회원가입 취소');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    try {
      const userProfile: UserProfile = {
        nickname: data.nickname,
        phoneNumber: data.phoneNumber,
        studentId: data.studentId,
        gender: data.gender,
      };

      console.log('서버로 전송할 데이터:', userProfile);

      // TODO: 서버로 전송하는 부분 추가
    } catch (error) {
      console.error('프로필 제출 중 오류 발생:', error);
      // TODO: 에러 토스트 표시
    }
  };

  return {
    onQuit,
    onSubmit,
  };
};
