import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { type NoticeResponse, useUpdateNotice } from '@workspace/api/generated';
import { type z } from 'zod';

import { noticePostingSchema } from '../utils/zodSchemas';

type NoticeEditFormData = z.infer<typeof noticePostingSchema>;

export type Props = {
  clubId: number;
  noticeId: number;
  initialData: NoticeResponse;
};

export const useEditNoticeForm = ({ clubId, noticeId, initialData }: Props) => {
  const { mutateAsync: mutateUpdateNotice } = useUpdateNotice();
  const form = useForm<NoticeEditFormData>({
    resolver: zodResolver(noticePostingSchema),
    mode: 'onChange',
    defaultValues: {
      title: initialData.title ?? '',
      content: initialData.content ?? '',
      isPinned: initialData.isPinned ?? false,
    },
  });

  const onSubmit = async (data: NoticeEditFormData): Promise<void> => {
    const notice = {
      title: data.title,
      content: data.content,
      isPinned: data.isPinned,
    };

    await mutateUpdateNotice({ clubId, noticeId, data: notice });
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
    isDirty: form.formState.isDirty,
  };
};
