import { useForm } from 'react-hook-form';

import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { useImage } from '@/app/register-club/_helpers/hooks/useImage';
import { uploadImageToS3 } from '@/app/register-club/_helpers/utils/uploadImageToS3';
import { usePostRegisterClubMutation } from '@/data/club/postRegisterClub/mutation';
import { type RegisterClubRequest } from '@/data/club/postRegisterClub/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import z from 'zod';

export const registerClubSchema = z.object({
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
    .regex(/^[a-zA-Z\s]*$/, '동아리 영문명은 영어만 입력 가능해요'),
  clubDescription: z
    .string()
    .trim()
    .min(1, '동아리 설명을 입력해주세요')
    .max(500, '동아리 설명은 최대 500자까지 입력 가능해요'),
});

export type RegisterClubFormData = z.infer<typeof registerClubSchema>;

export const useRegisterClubForm = () => {
  const { mutateAsync: mutateRegisterClub } = usePostRegisterClubMutation();
  const { imagePreviewUrl, image, onChangeImage } = useImage();
  const router = useRouter();

  const form = useForm<RegisterClubFormData>({
    resolver: zodResolver(registerClubSchema),
    mode: 'onChange',
    defaultValues: {
      clubProfileImage: undefined,
      clubName: '',
      clubEnglishName: '',
      clubDescription: '',
    },
  });

  const onGoBack = () => {
    form.clearErrors();
    form.reset();
    router.back();
  };

  const onSubmit = async (data: RegisterClubFormData): Promise<void> => {
    try {
      const thumbnailImageUrl = image
        ? await uploadImageToS3({ image, imageResourceType: 'CLUB_PROFILE' })
        : '';

      const club: RegisterClubRequest = {
        name: data.clubName,
        nameEn: data.clubEnglishName,
        description: data.clubDescription,
        thumbnailImageUrl,
        bannerImageUrl: '', // TODO: 배너 이미지 URL 추가
        roomInfo: '', // TODO: 동아리실 정보 추가
        groupChatLink: '', // TODO: 단체 채팅방 링크 추가
        groupChatPassword: '', // TODO: 단체 채팅방 비밀번호 추가
        dues: 0, // TODO: 회비 정보 추가
      };

      await mutateRegisterClub(club);

      alert('동아리 등록이 완료되었어요!');
      router.push(APP_PATH.DASHBOARD.NOTICE); // TODO: 동아리 전용 페이지로 이동
    } catch (error) {
      console.error('동아리 가입 중 오류 발생:', error);
      alert('동아리 등록에 실패했어요. 다시 시도해주세요.');
    }
  };

  return {
    form,
    isFormValid: form.formState.isValid,
    isSubmitting: form.formState.isSubmitting,
    imagePreviewUrl,
    onGoBack,
    onSubmit,
    onChangeImage,
  };
};
