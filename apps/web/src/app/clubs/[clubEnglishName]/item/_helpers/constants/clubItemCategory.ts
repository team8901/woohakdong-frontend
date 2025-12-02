import {
  DEFAULT_OPTION,
  DEFAULT_OPTION_LABEL,
} from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/defaultOption';

export const CLUB_ITEM_CATEGORY = {
  전자기기: 'DIGITAL',
  운동: 'SPORT',
  도서: 'BOOK',
  의류: 'CLOTHES',
  문구: 'STATIONERY',
  기타: 'ETC',
} as const;

export type ClubItemCategory =
  (typeof CLUB_ITEM_CATEGORY)[keyof typeof CLUB_ITEM_CATEGORY];

export const CLUB_ITEM_CATEGORY_MENU = Object.entries({
  [DEFAULT_OPTION_LABEL]: DEFAULT_OPTION,
  ...CLUB_ITEM_CATEGORY,
}).map(([label, value]) => ({
  label,
  value,
}));
