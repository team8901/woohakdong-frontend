import {
  DEFAULT_OPTION,
  DEFAULT_OPTION_LABEL,
} from '@/app/(dashboard)/member/_helpers/constants/defaultOption';

export const CLUB_MEMBER_ROLE = {
  멤버: 'MEMBER',
  임원: 'OFFICER',
  회장: 'PRESIDENT',
  부회장: 'VICEPRESIDENT',
  총무: 'SECRETARY',
} as const;

export type ClubMemberRole =
  (typeof CLUB_MEMBER_ROLE)[keyof typeof CLUB_MEMBER_ROLE];

export const CLUB_MEMBER_ROLE_MENU = Object.entries({
  [DEFAULT_OPTION_LABEL]: DEFAULT_OPTION,
  ...CLUB_MEMBER_ROLE,
}).map(([label, value]) => ({
  label,
  value,
}));
