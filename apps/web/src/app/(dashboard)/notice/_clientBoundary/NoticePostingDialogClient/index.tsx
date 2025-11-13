'use client';

import { useNoticePostingFlow } from '@/app/(dashboard)/notice/_helpers/hooks/useNoticePostingFlow';
import { trackEvent } from '@/eventTracker/trackEvent';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Spinner } from '@workspace/ui/components/spinner';
import { Textarea } from '@workspace/ui/components/textarea';
import { PlusIcon } from 'lucide-react';

type Props = {
  trackingEventName?: string;
};

export const NoticePostingDialogClient = ({
  trackingEventName = 'notice_posting_dialog_open',
}: Props) => {
  const { form, onSubmit, onQuit, isFormValid, isSubmitting } =
    useNoticePostingFlow();

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      onQuit();
    }
  };

  const handleTriggerClick = () => {
    trackEvent(trackingEventName);
  };

  return (
    <Dialog onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild onClick={handleTriggerClick}>
        <Button type="button">
          <PlusIcon />
          공지사항 등록
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>공지사항 등록</DialogTitle>
            </DialogHeader>
            <div className="grid w-full max-w-lg items-center gap-6 py-4">
              {/* 제목 입력 */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="text"
                        placeholder="공지사항 제목"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 내용 입력 */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내용</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="회원들에게 동아리 새로운 공지사항을 알려주세요"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onQuit}
                  disabled={isSubmitting}>
                  닫기
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!isFormValid || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner />
                    등록 중...
                  </>
                ) : (
                  '등록하기'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
