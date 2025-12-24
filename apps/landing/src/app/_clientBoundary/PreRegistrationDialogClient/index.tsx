'use client';

import type { PropsWithChildren } from 'react';

import { CLUB_CATEGORY_OPTIONS } from '@/app/_helpers/constants/regex';
import { usePreRegistrationFlow } from '@/app/_helpers/hooks/usePreRegistrationFlow';
import { trackEvent } from '@/eventTracker/trackEvent';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { EXTERNAL_LINKS } from '@workspace/ui/constants/links';

type Props = {
  trackingEventName?: string;
};

export const PreRegistrationDialogClient = ({
  children,
  trackingEventName = 'pre_registration_dialog_open',
}: PropsWithChildren<Props>) => {
  const { form, onSubmit, onQuit, submitStatus, isFormValid, isSubmitting } =
    usePreRegistrationFlow();

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
        {children}
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>사전 등록</DialogTitle>
              <DialogDescription>
                이메일 주소를 입력하시면 출시 소식을 알려드려요!
                <br />
                대학명과 동아리 카테고리는 추후에 추가될 기능을 위해 수집되는
                정보에요.
              </DialogDescription>
            </DialogHeader>
            <div className="grid w-full max-w-lg items-center gap-6 py-4">
              {/* 이메일 입력 */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        inputMode="email"
                        placeholder={EXTERNAL_LINKS.SUPPORT_EMAIL}
                        autoComplete="on"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 대학명 입력 */}
              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>대학명</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="text"
                        placeholder="아주대학교"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 동아리 카테고리 선택 */}
              <FormField
                control={form.control}
                name="clubCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>동아리 카테고리</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="카테고리" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent side="bottom" className="max-h-[12rem]">
                        {CLUB_CATEGORY_OPTIONS.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {submitStatus && (
                <div
                  className={`rounded-md p-3 text-sm ${
                    submitStatus.type === 'success'
                      ? 'bg-green-800/10 text-green-800'
                      : 'bg-red-800/10 text-red-800'
                  }`}>
                  {submitStatus.message}
                </div>
              )}
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
                {isSubmitting ? '등록 중...' : '등록하기'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
