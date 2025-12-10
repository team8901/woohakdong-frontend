'use client';

import { useRef, useState } from 'react';

import { useCurrentMembershipId } from '@/_shared/helpers/hooks/useCurrentMembershipId';
import { useIsEditable } from '@/_shared/helpers/hooks/useIsEditable';
import { getKeyByValue } from '@/_shared/helpers/utils/getKeyByValue';
import { showToast } from '@/_shared/helpers/utils/showToast';
import { CLUB_ITEM_CATEGORY } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/clubItemCategory';
import { CLUB_ITEM_RENTAL_STATUS } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/clubItemRentalStatus';
import { CLUB_ITEM_RENTAL_STATUS_TAG_STYLE } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/clubItemRentalStatusTagStyle';
import { DEFAULT_MAX_RENTAL_DAYS } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/rentalConfig';
import { useRentItemForm } from '@/app/clubs/[clubEnglishName]/item/_helpers/hooks/useRentItemForm';
import { getRentalStatusLabel } from '@/app/clubs/[clubEnglishName]/item/_helpers/utils/getRentalStatusLabel';
import { uploadImageToS3 } from '@/app/register-club/_helpers/utils/uploadImageToS3';
import { useQueryClient } from '@tanstack/react-query';
import {
  type ClubItemResponse,
  getGetClubItemQueryKey,
  getGetClubItemsQueryKey,
  useGetClubItem,
  useReturnClubItem,
} from '@workspace/api/generated';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
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
import { Label } from '@workspace/ui/components/label';
import { Spinner } from '@workspace/ui/components/spinner';
import { Camera, X } from 'lucide-react';
import Image from 'next/image';

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
  const [returnImagePreview, setReturnImagePreview] = useState<string | null>(null);
  const [returnImageBuffer, setReturnImageBuffer] = useState<ArrayBuffer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // 미리보기용 Data URL
      const previewReader = new FileReader();

      previewReader.onloadend = () => {
        setReturnImagePreview(previewReader.result as string);
      };
      previewReader.readAsDataURL(file);

      // S3 업로드용 ArrayBuffer
      const bufferReader = new FileReader();

      bufferReader.onloadend = () => {
        setReturnImageBuffer(bufferReader.result as ArrayBuffer);
      };
      bufferReader.readAsArrayBuffer(file);
    }
  };

  const handleRemoveImage = () => {
    setReturnImagePreview(null);
    setReturnImageBuffer(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReturn = async () => {
    if (!itemDetail?.id) return;

    setIsReturning(true);

    try {
      let returnImageUrl: string | undefined;

      if (returnImageBuffer) {
        returnImageUrl = await uploadImageToS3({
          image: returnImageBuffer,
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
      setReturnImagePreview(null);
      setReturnImageBuffer(null);
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
      setReturnImagePreview(null);
      setReturnImageBuffer(null);
      onRentQuit();
    }

    onOpenChange(newOpen);
  };

  const statusLabel = getRentalStatusLabel(item);
  const isBorrower =
    currentMembershipId != null &&
    itemDetail?.borrowerId === currentMembershipId;
  const canReturn = (isEditable || isBorrower) && item.using && itemDetail?.using;
  const canRent = isEditable && item.available && !item.using;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-md">
        {mode === 'detail' && (
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
                        <p className="font-medium">
                          {itemDetail.dueDate ?? '-'}
                        </p>
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
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                닫기
              </Button>
              {canRent && (
                <Button onClick={() => setMode('rent')}>대여하기</Button>
              )}
              {canReturn && (
                <Button onClick={() => setMode('return')}>반납하기</Button>
              )}
            </DialogFooter>
          </>
        )}

        {mode === 'rent' && (
          <Form {...rentForm}>
            <form onSubmit={rentForm.handleSubmit(onRentSubmit)}>
              <DialogHeader>
                <DialogTitle>물품 대여</DialogTitle>
                <DialogDescription>{item.name}</DialogDescription>
              </DialogHeader>
              <div className="grid w-full items-center gap-6 py-4">
                <FormField
                  control={rentForm.control}
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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
                  onClick={() => {
                    onRentQuit();
                    setMode('detail');
                  }}
                  disabled={isRentSubmitting}>
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={!isRentFormValid || isRentSubmitting}>
                  {isRentSubmitting ? (
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
        )}

        {mode === 'return' && (
          <>
            <DialogHeader>
              <DialogTitle>물품 반납</DialogTitle>
              <DialogDescription>{item.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>반납 인증 사진 (선택)</Label>
                <div className="flex flex-col gap-3">
                  {returnImagePreview ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                      <Image
                        src={returnImagePreview}
                        alt="반납 인증 사진"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="bg-destructive text-destructive-foreground absolute right-2 top-2 rounded-full p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-muted-foreground/25 hover:border-muted-foreground/50 flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors">
                      <Camera className="text-muted-foreground h-8 w-8" />
                      <span className="text-muted-foreground text-sm">
                        사진 첨부하기
                      </span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  물품 상태를 확인할 수 있는 사진을 첨부해주세요.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMode('detail');
                  handleRemoveImage();
                }}
                disabled={isReturning}>
                취소
              </Button>
              <Button onClick={handleReturn} disabled={isReturning}>
                {isReturning ? (
                  <>
                    <Spinner />
                    반납 중...
                  </>
                ) : (
                  '반납하기'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
