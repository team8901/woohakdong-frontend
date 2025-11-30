export const CLUB_ITEM_SORT_OPTION = {
  최신순: 'CREATED_AT_DESC',
  이름: 'NAME_ASC',
  카테고리: 'CATEGORY_ASC',
} as const;

export type ClubItemSortOption =
  (typeof CLUB_ITEM_SORT_OPTION)[keyof typeof CLUB_ITEM_SORT_OPTION];

export const CLUB_ITEM_SORT_OPTION_MENU = Object.entries(
  CLUB_ITEM_SORT_OPTION,
).map(([label, value]) => ({
  label,
  value,
}));
