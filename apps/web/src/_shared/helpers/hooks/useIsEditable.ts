import { CLUB_MEMBER_ROLE } from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/clubMemberRole';

const getCookieValue = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;

  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));

  return match?.[2] ? decodeURIComponent(match[2]) : undefined;
};

export const useIsEditable = () => {
  const clubMemberRole = getCookieValue('clubMemberRole');

  return clubMemberRole === CLUB_MEMBER_ROLE.회장;
};
