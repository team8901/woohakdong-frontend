export const CLUB_MEMBER_SORT_OPTION = {
  가입일: 'CREATED_AT_DESC',
  이름: 'NAME_ASC',
  학과: 'DEPARTMENT_ASC',
} as const;

export type ClubMemberSortOption =
  (typeof CLUB_MEMBER_SORT_OPTION)[keyof typeof CLUB_MEMBER_SORT_OPTION];

export const CLUB_MEMBER_SORT_OPTION_MENU = Object.entries(
  CLUB_MEMBER_SORT_OPTION,
).map(([label, value]) => ({
  label,
  value,
}));
