import {
  CLUB_MEMBER_ROLE,
  type ClubMemberRole,
} from '@/app/(dashboard)/member/_helpers/constants/clubMemberRole';

export const CLUB_MEMBER_ROLE_TAG_STYLE: Record<ClubMemberRole, string> = {
  [CLUB_MEMBER_ROLE.회장]: 'bg-purple-100 text-purple-700',
  [CLUB_MEMBER_ROLE.부회장]: 'bg-blue-100 text-blue-700',
  [CLUB_MEMBER_ROLE.총무]: 'bg-green-100 text-green-700',
  [CLUB_MEMBER_ROLE.임원]: 'bg-orange-100 text-orange-700',
  [CLUB_MEMBER_ROLE.멤버]: 'bg-gray-100 text-gray-700',
} as const;
