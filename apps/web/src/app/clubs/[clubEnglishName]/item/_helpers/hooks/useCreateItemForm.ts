import { useForm } from 'react-hook-form';

import { showToast } from '@/_shared/helpers/utils/showToast';
import {
  CLUB_ITEM_CATEGORY,
  type ClubItemCategory,
} from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/clubItemCategory';
import { DEFAULT_MAX_RENTAL_DAYS } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/rentalConfig';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetClubItemsQueryKey,
  useAddClubItem,
} from '@workspace/api/generated';
import { z } from 'zod';

const createItemSchema = z.object({
  name: z.string().min(1, '물품명을 입력해주세요.'),
  category: z.custom<ClubItemCategory>(
    (val) =>
      Object.values(CLUB_ITEM_CATEGORY).includes(val as ClubItemCategory),
    '카테고리를 선택해주세요.',
  ),
  location: z.string().optional(),
  description: z.string().optional(),
  rentalMaxDay: z
    .number()
    .min(1, '최소 1일 이상이어야 합니다.')
    .max(365, '최대 365일까지 설정 가능합니다.'),
});

type CreateItemFormData = z.infer<typeof createItemSchema>;

export type Props = {
  clubId: number;
  onSuccess?: () => void;
};

export const useCreateItemForm = ({ clubId, onSuccess }: Props) => {
  const queryClient = useQueryClient();
  const { mutateAsync: mutateAddItem } = useAddClubItem();

  const form = useForm<CreateItemFormData>({
    resolver: zodResolver(createItemSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      category: undefined,
      location: '',
      description: '',
      rentalMaxDay: DEFAULT_MAX_RENTAL_DAYS,
    },
  });

  const onSubmit = async (data: CreateItemFormData): Promise<void> => {
    try {
      await mutateAddItem({
        clubId,
        data: {
          name: data.name,
          category: data.category,
          location: data.location || undefined,
          description: data.description || undefined,
          rentalMaxDay: data.rentalMaxDay,
        },
      });

      await queryClient.invalidateQueries({
        queryKey: getGetClubItemsQueryKey(clubId),
      });

      showToast({ message: '물품이 등록되었습니다.', type: 'success' });
      onSuccess?.();
    } catch {
      showToast({ message: '물품 등록에 실패했습니다.', type: 'error' });
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
