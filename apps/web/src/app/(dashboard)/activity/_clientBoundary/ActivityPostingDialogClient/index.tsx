'use client';

import { useState } from 'react';

import { usePostingActivityForm } from '@/app/(dashboard)/activity/_helpers/hooks/usePostingActivityForm';
import { trackEvent } from '@/eventTracker/trackEvent';
import { Button } from '@workspace/ui/components/button';
import { Calendar } from '@workspace/ui/components/calendar';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Spinner } from '@workspace/ui/components/spinner';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { ChevronDownIcon, ImageUpIcon, InfoIcon, PlusIcon } from 'lucide-react';
import Image from 'next/image';

const TAG_OPTIONS = [
  { value: 'STUDY', label: '스터디' },
  { value: 'PARTY', label: '회식' },
  { value: 'MEETING', label: '회의' },
  { value: 'MT', label: 'MT' },
  { value: 'ETC', label: '기타' },
];

type Props = {
  trackingEventName?: string;
};

export const ActivityPostingDialogClient = ({
  trackingEventName = 'activity_posting_dialog_open',
}: Props) => {
  const [open, setOpen] = useState(false);
  const {
    form,
    onSubmit,
    onQuit,
    isFormValid,
    isSubmitting,
    imagePreviewUrl,
    onChangeImage,
  } = usePostingActivityForm();

  return (
    <Dialog onOpenChange={onQuit}>
      <DialogTrigger asChild onClick={() => trackEvent(trackingEventName)}>
        <Button type="button">
          <PlusIcon />
          활동 기록 등록
        </Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-h-[90vh] max-w-[95vw] overflow-auto md:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>활동 기록 등록</DialogTitle>
            </DialogHeader>
            <div className="grid w-full items-center gap-6 py-4">
              {/* 활동 사진 등록 */}
              <FormField
                control={form.control}
                name="activityImages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      활동 사진
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon
                            tabIndex={-1}
                            className="size-3.5 opacity-50"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>권장: png or jpeg (10MB 이하)</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="hidden"
                        id="activityImages"
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];

                          field.onChange(file); // Zod에서 File로 유효성 검사 가능

                          onChangeImage(e); // 이미지 미리보기 업데이트
                        }}
                      />
                    </FormControl>
                    {/* 이미지 미리보기 */}
                    <div
                      className="border-border hover:bg-accent flex aspect-[4/3] w-40 shrink-0 items-center justify-center rounded-md border"
                      onClick={() => {
                        document.getElementById('activityImages')?.click();
                      }}>
                      {imagePreviewUrl ? (
                        <Image
                          src={imagePreviewUrl}
                          alt="활동 기록 사진"
                          className="h-full w-full rounded-md object-cover"
                          width={160}
                          height={120}
                        />
                      ) : (
                        <ImageUpIcon className="text-muted-foreground size-5" />
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        placeholder="제목을 입력해주세요"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 활동 날짜 선택*/}
              <FormField
                control={form.control}
                name="activityDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>활동 날짜</FormLabel>
                    <div className="grid flex-1 gap-2">
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="trigger"
                            id="activityDate"
                            className={
                              field.value
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }>
                            {field.value
                              ? new Date(field.value).toLocaleDateString()
                              : '날짜를 선택해주세요'}
                            <ChevronDownIcon className="size-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-full overflow-hidden"
                          align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              if (!date) return;

                              const dateOffset =
                                new Date().getTimezoneOffset() * 60000; // UTC 타임존 시차 보정
                              const dateWithOffset = new Date(
                                date.getTime() - dateOffset,
                              );

                              field.onChange(dateWithOffset.toISOString());
                              setOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 참여 인원 입력, 태그 선택 */}
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="participantCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>참여 인원</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="numeric"
                            placeholder="참여 인원을 입력해주세요"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="tag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>태그</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="태그를 선택해주세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TAG_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 내용 입력 */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내용</FormLabel>
                    <FormControl>
                      <Textarea
                        className="h-[calc(25vh)]"
                        placeholder="내용을 입력해주세요"
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
