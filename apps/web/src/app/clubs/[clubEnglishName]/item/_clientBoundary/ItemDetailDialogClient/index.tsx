'use client';

import { useState } from 'react';

import { useCurrentMembershipId } from '@/_shared/helpers/hooks/useCurrentMembershipId';
import { useIsEditable } from '@/_shared/helpers/hooks/useIsEditable';
import { showToast } from '@/_shared/helpers/utils/showToast';
import { DEFAULT_MAX_RENTAL_DAYS } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/rentalConfig';
import { useRentItemForm } from '@/app/clubs/[clubEnglishName]/item/_helpers/hooks/useRentItemForm';
import { uploadImageToS3 } from '@/app/register-club/_helpers/utils/uploadImageToS3';
import { useQueryClient } from '@tanstack/react-query';
import {
  type ClubItemResponse,
  getGetClubItemQueryKey,
  getGetClubItemsQueryKey,
  useGetClubItem,
  useReturnClubItem,
} from '@workspace/api/generated';
import { Dialog, DialogContent } from '@workspace/ui/components/dialog';

import { ItemDetailView } from './ItemDetailView';
import { ItemRentForm } from './ItemRentForm';
import { ItemReturnForm } from './ItemReturnForm';

type Props = {
  clubId: number;
  item: ClubItemResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Mode = 'detail' | 'rent' | 'return';

export const ItemDetailDialogClient = ({
  clubId,
  item,
  open,
  onOpenChange,
}: Props) => {
  const isEditable = useIsEditable();
  const currentMembershipId = useCurrentMembershipId();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>('detail');
  const [isReturning, setIsReturning] = useState(false);

  const { data: itemDetail, isLoading } = useGetClubItem(clubId, item.id!, {
    query: {
      queryKey: getGetClubItemQueryKey(clubId, item.id!),
      enabled: open && item.id != null,
    },
  });

  const { mutateAsync: mutateReturnItem } = useReturnClubItem();

  const maxRentalDays = item.rentalMaxDay ?? DEFAULT_MAX_RENTAL_DAYS;
  const {
    form: rentForm,
    onSubmit: onRentSubmit,
    onQuit: onRentQuit,
    isFormValid: isRentFormValid,
    isSubmitting: isRentSubmitting,
  } = useRentItemForm({
    clubId,
    itemId: item.id!,
    maxRentalDays,
    onSuccess: () => {
      setMode('detail');
      onOpenChange(false);
    },
  });

  const handleReturn = async (imageBuffer: ArrayBuffer | null) => {
    if (!itemDetail?.id) return;

    setIsReturning(true);

    try {
      let returnImageUrl: string | undefined;

      if (imageBuffer) {
        returnImageUrl = await uploadImageToS3({
          image: imageBuffer,
          imageResourceType: 'CLUB_PROFILE', // TODO: ITEM_RETURN 타입 추가 시 변경
        });
      }

      await mutateReturnItem({
        clubId,
        itemId: itemDetail.id,
        data: {
          returnImage: returnImageUrl,
        },
      });

      await queryClient.invalidateQueries({
        queryKey: getGetClubItemsQueryKey(clubId),
      });

      showToast({ message: '물품이 반납되었습니다.', type: 'success' });
      setMode('detail');
      onOpenChange(false);
    } catch {
      showToast({ message: '물품 반납에 실패했습니다.', type: 'error' });
    } finally {
      setIsReturning(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setMode('detail');
      onRentQuit();
    }

    onOpenChange(newOpen);
  };

  const isBorrower =
    currentMembershipId != null &&
    itemDetail?.borrowerId === currentMembershipId;
  const canReturn =
    (isEditable || isBorrower) && !!item.using && !!itemDetail?.using;
  const canRent = isEditable && !!item.available && !item.using;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-md">
        {mode === 'detail' && (
          <ItemDetailView
            item={item}
            itemDetail={itemDetail}
            isLoading={isLoading}
            maxRentalDays={maxRentalDays}
            canRent={canRent}
            canReturn={canReturn}
            onClose={() => handleOpenChange(false)}
            onRent={() => setMode('rent')}
            onReturn={() => setMode('return')}
          />
        )}

        {mode === 'rent' && (
          <ItemRentForm
            item={item}
            form={rentForm}
            maxRentalDays={maxRentalDays}
            isFormValid={isRentFormValid}
            isSubmitting={isRentSubmitting}
            onSubmit={onRentSubmit}
            onCancel={() => {
              onRentQuit();
              setMode('detail');
            }}
          />
        )}

        {mode === 'return' && (
          <ItemReturnForm
            item={item}
            isSubmitting={isReturning}
            onSubmit={handleReturn}
            onCancel={() => setMode('detail')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
