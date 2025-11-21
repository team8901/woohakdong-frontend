import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';

import { noticePostingSchema } from '../../[id]/zodSchemas';

type NoticePostingFormData = z.infer<typeof noticePostingSchema>;

export const usePostingNoticeForm = () => {
  const form = useForm<NoticePostingFormData>({
    resolver: zodResolver(noticePostingSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      content: '',
    },
  });

  /** @todo 등록하는 로직 구현 */
  const onSubmit = async (): Promise<void> => {};

  const onQuit = async (): Promise<void> => {
    form.reset();
    form.clearErrors();
  };

  return {
    form,
    onSubmit,
    onQuit,
    isFormValid: form.formState.isValid,
    isSubmitting: form.formState.isSubmitting,
  };
};
