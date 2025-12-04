import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateNotice } from '@workspace/api/generated';
import { type z } from 'zod';

import { noticePostingSchema } from '../utils/zodSchemas';

type NoticePostingFormData = z.infer<typeof noticePostingSchema>;

export type Props = {
  clubId: number;
};

export const usePostingNoticeForm = ({ clubId }: Props) => {
  const { mutateAsync: mutateCreateNotice } = useCreateNotice();
  const form = useForm<NoticePostingFormData>({
    resolver: zodResolver(noticePostingSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      content: '',
      isPinned: false,
    },
  });

  const onSubmit = async (data: NoticePostingFormData): Promise<void> => {
    const notice = {
      title: data.title,
      content: data.content,
      isPinned: data.isPinned,
    };

    await mutateCreateNotice({ clubId, data: notice });
  };

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
