import { useForm } from 'react-hook-form';

import { useImage } from '@/_shared/helpers/hooks/useImage';
import { zodResolver } from '@hookform/resolvers/zod';
import type z from 'zod';

import { activityPostingSchema } from '../utils/zodSchemas';

const MAX_IMAGE_LENGTH = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type ActivityPostingFormData = z.infer<typeof activityPostingSchema>;

export const usePostingActivityForm = () => {
  const { imagePreviewUrl, image, onChangeImage, clearImage } = useImage({
    maxImageLength: MAX_IMAGE_LENGTH,
    maxFileSize: MAX_FILE_SIZE,
  });

  const form = useForm<ActivityPostingFormData>({
    resolver: zodResolver(activityPostingSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      content: '',
      participantCount: '',
      activityDate: '',
      tag: undefined,
      activityImages: undefined,
    },
  });

  /** @todo 등록하는 로직 구현 */
  const onSubmit = () => {
    console.log(form.getValues());
  };

  const onQuit = () => {
    form.reset();
    form.clearErrors();
    clearImage();
  };

  return {
    form,
    onSubmit,
    onQuit,
    isFormValid: form.formState.isValid,
    isSubmitting: form.formState.isSubmitting,
    imagePreviewUrl,
    image,
    onChangeImage,
  };
};
