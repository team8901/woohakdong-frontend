import {
  DEFAULT_OPTION,
  DEFAULT_OPTION_LABEL,
} from '@/app/(dashboard)/member/_helpers/constants/defaultOption';

export const CLUB_ITEM_RENTAL_STATUS = {
  '대여 가능': 'AVAILABLE',
  '대여 중': 'RENTED',
  '대여 불가': 'UNAVAILABLE',
} as const;

export type ClubItemRentalStatus =
  (typeof CLUB_ITEM_RENTAL_STATUS)[keyof typeof CLUB_ITEM_RENTAL_STATUS];

export type ClubItemRentalStatusLabel = keyof typeof CLUB_ITEM_RENTAL_STATUS;

export const CLUB_ITEM_RENTAL_STATUS_MENU = Object.entries({
  [DEFAULT_OPTION_LABEL]: DEFAULT_OPTION,
  ...CLUB_ITEM_RENTAL_STATUS,
}).map(([label, value]) => ({
  label,
  value,
}));
