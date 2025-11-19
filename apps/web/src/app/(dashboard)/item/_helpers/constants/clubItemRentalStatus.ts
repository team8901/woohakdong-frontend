import {
  DEFAULT_OPTION,
  DEFAULT_OPTION_LABEL,
} from '@/app/(dashboard)/member/_helpers/constants/defaultOption';

export const CLUB_ITEM_RENTAL_STATUS = {
  대여가능: 'AVAILABLE',
  대여중: 'RENTED',
} as const;

export type ClubItemRentalStatus =
  (typeof CLUB_ITEM_RENTAL_STATUS)[keyof typeof CLUB_ITEM_RENTAL_STATUS];

export const CLUB_ITEM_RENTAL_STATUS_MENU = Object.entries({
  [DEFAULT_OPTION_LABEL]: DEFAULT_OPTION,
  ...CLUB_ITEM_RENTAL_STATUS,
}).map(([label, value]) => ({
  label,
  value,
}));
