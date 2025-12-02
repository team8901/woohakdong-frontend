import {
  CLUB_ITEM_HISTORY_RENTAL_STATUS,
  type ClubItemHistoryRentalStatus,
} from '@/app/clubs/[clubEnglishName]/item-history/_helpers/constants/clubItemHistoryRentalStatus';

export const CLUB_ITEM_HISTORY_RENTAL_STATUS_TAG_STYLE: Record<
  ClubItemHistoryRentalStatus,
  string
> = {
  [CLUB_ITEM_HISTORY_RENTAL_STATUS.연체]: 'bg-red-100 text-red-700',
  [CLUB_ITEM_HISTORY_RENTAL_STATUS['반납 완료']]: 'bg-gray-100 text-gray-700',
  [CLUB_ITEM_HISTORY_RENTAL_STATUS['대여 중']]: 'bg-blue-100 text-blue-700',
} as const;
