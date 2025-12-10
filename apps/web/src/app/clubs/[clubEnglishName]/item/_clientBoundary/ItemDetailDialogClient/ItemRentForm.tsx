import { type UseFormReturn } from 'react-hook-form';

import { type ClubItemResponse } from '@workspace/api/generated';
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

type RentFormData = {
  rentalDays: number;
};

type Props = {
  item: ClubItemResponse;
  form: UseFormReturn<RentFormData>;
  maxRentalDays: number;
  isFormValid: boolean;
  isSubmitting: boolean;
  onSubmit: (data: RentFormData) => Promise<void>;
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
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={maxRentalDays}
                    placeholder="대여 일수를 입력해주세요"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
