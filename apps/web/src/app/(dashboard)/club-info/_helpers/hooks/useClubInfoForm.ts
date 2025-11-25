import { useForm } from 'react-hook-form';

import { showToast } from '@/_shared/helpers/utils/showToast';
import { useImage } from '@/app/register-club/_helpers/hooks/useImage';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';

export const clubInfoSchema = z.object({
  clubProfileImage: z.instanceof(File).optional(),
  clubName: z
    .string()
    .trim()
    .min(1, '동아리 이름을 입력해주세요')
    .max(20, '동아리 이름은 최대 20자까지 입력 가능해요'),
  clubEnglishName: z
    .string()
    .trim()
    .min(1, '동아리 영문명을 입력해주세요')
    .max(20, '동아리 영문명은 최대 20자까지 입력 가능해요')
    .regex(/^[a-zA-Z0-9\s]*$/, '동아리 영문명은 영어, 숫자만 입력 가능해요'),
  clubDescription: z
    .string()
    .trim()
    .min(1, '동아리 설명을 입력해주세요')
    .max(500, '동아리 설명은 최대 500자까지 입력 가능해요'),
});

export type ClubInfoFormData = z.infer<typeof clubInfoSchema>;

// TODO: get club info data from server
const MOCK_DATA = {
  clubProfileImage: '',
  clubName: '우학동',
  clubEnglishName: 'woohakdong',
  clubDescription: '우아한 개발 동아리',
};

export const useClubInfoForm = () => {
  const { imagePreviewUrl, onChangeImage } = useImage();

  const form = useForm<ClubInfoFormData>({
    resolver: zodResolver(clubInfoSchema),
    mode: 'onChange',
    defaultValues: {
      clubProfileImage: undefined,
      clubName: MOCK_DATA.clubName,
      clubEnglishName: MOCK_DATA.clubEnglishName,
      clubDescription: MOCK_DATA.clubDescription,
    },
  });

  const onSubmit = async (data: ClubInfoFormData): Promise<void> => {
    try {
      // TODO: Implement update logic
      console.log(data);
      showToast({
        message: '동아리 정보가 수정되었어요',
        type: 'success',
      });
    } catch (error) {
      console.error('동아리 정보 수정 중 오류 발생:', error);
      showToast({
        message: '동아리 정보 수정에 실패했어요',
        type: 'error',
      });
    }
  };

  return {
    form,
    isFormValid: form.formState.isValid,
    isSubmitting: form.formState.isSubmitting,
    imagePreviewUrl: imagePreviewUrl || MOCK_DATA.clubProfileImage,
    onSubmit,
    onChangeImage,
  };
};
