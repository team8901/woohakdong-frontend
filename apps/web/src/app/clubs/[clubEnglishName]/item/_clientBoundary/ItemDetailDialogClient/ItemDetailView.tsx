import { getKeyByValue } from '@/_shared/helpers/utils/getKeyByValue';
import { CLUB_ITEM_CATEGORY } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/clubItemCategory';
import { CLUB_ITEM_RENTAL_STATUS } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/clubItemRentalStatus';
import { CLUB_ITEM_RENTAL_STATUS_TAG_STYLE } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/clubItemRentalStatusTagStyle';
import { getRentalStatusLabel } from '@/app/clubs/[clubEnglishName]/item/_helpers/utils/getRentalStatusLabel';
import {
  type ClubItemDetailResponse,
  type ClubItemResponse,
} from '@workspace/api/generated';
import { Button } from '@workspace/ui/components/button';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Spinner } from '@workspace/ui/components/spinner';
import Image from 'next/image';

type Props = {
  item: ClubItemResponse;
  itemDetail?: ClubItemDetailResponse;
  isLoading: boolean;
  maxRentalDays: number;
  canRent: boolean;
  canReturn: boolean;
  onClose: () => void;
  onRent: () => void;
  onReturn: () => void;
};

export const ItemDetailView = ({
  item,
  itemDetail,
  isLoading,
  maxRentalDays,
  canRent,
  canReturn,
  onClose,
  onRent,
  onReturn,
}: Props) => {
  const statusLabel = getRentalStatusLabel(item);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{item.name}</DialogTitle>
        <DialogDescription>물품 상세 정보</DialogDescription>
      </DialogHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4 py-4">
          {itemDetail?.photo && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={itemDetail.photo}
                alt={item.name ?? '물품 이미지'}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">카테고리</p>
              <p className="font-medium">
                {item.category
                  ? getKeyByValue(CLUB_ITEM_CATEGORY, item.category)
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">보관 위치</p>
              <p className="font-medium">{item.location ?? '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">대여 상태</p>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CLUB_ITEM_RENTAL_STATUS_TAG_STYLE[CLUB_ITEM_RENTAL_STATUS[statusLabel]]}`}>
                {statusLabel}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground">최대 대여 일수</p>
              <p className="font-medium">{maxRentalDays}일</p>
            </div>
            {itemDetail?.using && (
              <>
                <div>
                  <p className="text-muted-foreground">대여자</p>
                  <p className="font-medium">
                    {itemDetail.borrowerName ?? '-'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">반납 예정일</p>
                  <p className="font-medium">{itemDetail.dueDate ?? '-'}</p>
                </div>
              </>
            )}
          </div>
          {item.description && (
            <div className="text-sm">
              <p className="text-muted-foreground">설명</p>
              <p className="mt-1">{item.description}</p>
            </div>
          )}
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
        {canRent && <Button onClick={onRent}>대여하기</Button>}
        {canReturn && <Button onClick={onReturn}>반납하기</Button>}
      </DialogFooter>
    </>
  );
};
