import { useForm } from 'react-hook-form';

import { showToast } from '@/_shared/helpers/utils/showToast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetClubItemsQueryKey,
  useRentClubItem,
} from '@workspace/api/generated';
import { z } from 'zod';

const createRentItemSchema = (maxRentalDays: number) =>
  z.object({
    rentalDays: z
      .number()
      .min(1, '최소 1일 이상이어야 합니다.')
      .max(maxRentalDays, `최대 ${maxRentalDays}일까지 대여 가능합니다.`),
  });

type RentItemFormData = z.infer<ReturnType<typeof createRentItemSchema>>;

export type Props = {
  clubId: number;
  itemId: number;
  maxRentalDays: number;
  onSuccess?: () => void;
};

export const useRentItemForm = ({
  clubId,
  itemId,
  maxRentalDays,
  onSuccess,
}: Props) => {
  const queryClient = useQueryClient();
  const { mutateAsync: mutateRentItem } = useRentClubItem();

  const form = useForm<RentItemFormData>({
    resolver: zodResolver(createRentItemSchema(maxRentalDays)),
    mode: 'onChange',
    criteriaMode: 'firstError',
    defaultValues: {
      rentalDays: 1,
    },
  });

  const onSubmit = async (data: RentItemFormData): Promise<void> => {
    try {
      await mutateRentItem({
        clubId,
        itemId,
        data: { rentalDays: data.rentalDays },
      });

      await queryClient.invalidateQueries({
        queryKey: getGetClubItemsQueryKey(clubId),
      });

      showToast({ message: '물품 대여가 완료되었습니다.', type: 'success' });
      onSuccess?.();
    } catch {
      showToast({ message: '물품 대여에 실패했습니다.', type: 'error' });
    }
  };

  const onQuit = (): void => {
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
