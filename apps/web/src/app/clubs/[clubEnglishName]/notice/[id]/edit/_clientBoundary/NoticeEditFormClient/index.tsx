'use client';

import { useEditNoticeForm } from '@/app/clubs/[clubEnglishName]/notice/_helpers/hooks/useEditNoticeForm';
import { type NoticeResponse } from '@workspace/api/generated';
import { Button } from '@workspace/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Spinner } from '@workspace/ui/components/spinner';
import { Textarea } from '@workspace/ui/components/textarea';
import { useRouter } from 'next/navigation';

type Props = {
  clubId: number;
  noticeId: number;
  initialData: NoticeResponse;
};

export const NoticeEditFormClient = ({
  clubId,
  noticeId,
  initialData,
}: Props) => {
  const router = useRouter();

  const { form, onSubmit, isFormValid, isSubmitting, isDirty } =
    useEditNoticeForm({
      clubId,
      noticeId,
      initialData,
    });

  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = async (data: Parameters<typeof onSubmit>[0]) => {
    await onSubmit(data);
    router.back();
  };

  return (
    <div className="flex w-full flex-col items-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex w-full max-w-3xl flex-col space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="text"
                    placeholder="제목을 입력해주세요"
                    className="border-none p-0 text-2xl font-bold tracking-tight shadow-none focus-visible:ring-0 md:text-3xl"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="prose w-full max-w-none">
                <FormControl>
                  <Textarea
                    className="resize-none border-none p-0 text-lg leading-relaxed shadow-none focus-visible:ring-0"
                    placeholder="내용을 입력해주세요"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}>
              취소
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting || !isDirty}>
              {isSubmitting ? (
                <>
                  <Spinner />
                  수정 중...
                </>
              ) : (
                '수정하기'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
