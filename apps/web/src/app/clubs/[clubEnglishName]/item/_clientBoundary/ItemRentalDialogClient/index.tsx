'use client';

import { useState } from 'react';

import { useIsEditable } from '@/_shared/helpers/hooks/useIsEditable';
import { DEFAULT_MAX_RENTAL_DAYS } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/rentalConfig';
import { useRentItemForm } from '@/app/clubs/[clubEnglishName]/item/_helpers/hooks/useRentItemForm';
import { type ClubItemResponse } from '@workspace/api/generated';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Spinner } from '@workspace/ui/components/spinner';

type Props = {
  clubId: number;
  item: ClubItemResponse;
};

export const ItemRentalDialogClient = ({ clubId, item }: Props) => {
  const isEditable = useIsEditable();
  const [isOpen, setIsOpen] = useState(false);
  // Input은 문자열로 표시하고(빈 값 허용), react-hook-form에는 숫자로 전달해야 해서 별도 상태로 관리
  const [inputValue, setInputValue] = useState('1');

  const { form, onSubmit, onQuit, isFormValid, isSubmitting } = useRentItemForm(
    {
      clubId,
      itemId: item.id!,
      maxRentalDays: item.rentalMaxDay ?? DEFAULT_MAX_RENTAL_DAYS,
      onSuccess: () => setIsOpen(false),
    },
  );

  if (!isEditable) return null;

  if (!item.available) return null;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      setInputValue('1');
      onQuit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          대여
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[95vw] md:max-w-sm"
        onInteractOutside={(e) => e.preventDefault()}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>물품 대여</DialogTitle>
              <DialogDescription>{item.name}</DialogDescription>
            </DialogHeader>
            <div className="grid w-full items-center gap-6 py-4">
              <FormField
                control={form.control}
                name="rentalDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>대여 일수</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="대여 일수를 입력해주세요"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={inputValue}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');

                          setInputValue(value);
                          field.onChange(
                            value === '' ? undefined : Number(value),
                          );
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      최대 {item.rentalMaxDay ?? DEFAULT_MAX_RENTAL_DAYS}일까지
                      대여 가능합니다.
                    </FormDescription>
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
                    대여 중...
                  </>
                ) : (
                  '대여하기'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
