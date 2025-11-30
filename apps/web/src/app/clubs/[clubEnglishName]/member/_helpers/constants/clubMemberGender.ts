import {
  DEFAULT_OPTION,
  DEFAULT_OPTION_LABEL,
} from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/defaultOption';

export const CLUB_MEMBER_GENDER = {
  여자: 'FEMALE',
  남자: 'MALE',
} as const;

export type ClubMemberGender =
  (typeof CLUB_MEMBER_GENDER)[keyof typeof CLUB_MEMBER_GENDER];

export const CLUB_MEMBER_GENDER_MENU = Object.entries({
  [DEFAULT_OPTION_LABEL]: DEFAULT_OPTION,
  ...CLUB_MEMBER_GENDER,
}).map(([label, value]) => ({
  label,
  value,
}));
