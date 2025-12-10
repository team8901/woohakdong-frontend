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
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={item.rentalMaxDay ?? DEFAULT_MAX_RENTAL_DAYS}
                        placeholder="대여 일수를 입력해주세요"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      최대 {item.rentalMaxDay ?? DEFAULT_MAX_RENTAL_DAYS}일까지 대여 가능합니다.
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
