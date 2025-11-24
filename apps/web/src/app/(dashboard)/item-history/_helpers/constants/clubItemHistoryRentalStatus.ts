import {
  DEFAULT_OPTION,
  DEFAULT_OPTION_LABEL,
} from '@/app/(dashboard)/member/_helpers/constants/defaultOption';

export const CLUB_ITEM_HISTORY_RENTAL_STATUS = {
  대여중: 'RENTED',
  반납완료: 'RETURNED',
  연체: 'OVERDUE',
} as const;

export type ClubItemHistoryRentalStatus =
  (typeof CLUB_ITEM_HISTORY_RENTAL_STATUS)[keyof typeof CLUB_ITEM_HISTORY_RENTAL_STATUS];

export const CLUB_ITEM_HISTORY_RENTAL_STATUS_MENU = Object.entries({
  [DEFAULT_OPTION_LABEL]: DEFAULT_OPTION,
  ...CLUB_ITEM_HISTORY_RENTAL_STATUS,
}).map(([label, value]) => ({
  label,
  value,
}));
