import {
  CLUB_ITEM_RENTAL_STATUS,
  type ClubItemRentalStatus,
} from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/clubItemRentalStatus';

export const CLUB_ITEM_RENTAL_STATUS_TAG_STYLE: Record<
  ClubItemRentalStatus,
  string
> = {
  [CLUB_ITEM_RENTAL_STATUS['대여 가능']]: 'bg-gray-100 text-gray-700',
  [CLUB_ITEM_RENTAL_STATUS['대여 중']]: 'bg-blue-100 text-blue-700',
  [CLUB_ITEM_RENTAL_STATUS['대여 불가']]: 'bg-orange-100 text-orange-700',
} as const;
