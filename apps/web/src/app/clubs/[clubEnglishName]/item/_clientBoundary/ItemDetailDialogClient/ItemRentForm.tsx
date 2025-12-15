import { useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';

import {
  type ClubItemRentRequest,
  type ClubItemResponse,
} from '@workspace/api/generated';
import { Button } from '@workspace/ui/components/button';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  item: ClubItemResponse;
  form: UseFormReturn<ClubItemRentRequest>;
  maxRentalDays: number;
  isFormValid: boolean;
  isSubmitting: boolean;
  onSubmit: (data: ClubItemRentRequest) => Promise<void>;
  onCancel: () => void;
};

export const ItemRentForm = ({
  item,
  form,
  maxRentalDays,
  isFormValid,
  isSubmitting,
  onSubmit,
  onCancel,
}: Props) => {
  // Input은 문자열로 표시하고(빈 값 허용), react-hook-form에는 숫자로 전달해야 해서 별도 상태로 관리
  const [inputValue, setInputValue] = useState('1');

  return (
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
                      field.onChange(value === '' ? undefined : Number(value));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  최대 {maxRentalDays}일까지 대여 가능합니다.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}>
            취소
          </Button>
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
  );
};
