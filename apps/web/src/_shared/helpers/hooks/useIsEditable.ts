import { getCookieValue } from '@/_shared/helpers/utils/getCookieValue';
import { CLUB_MEMBER_ROLE } from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/clubMemberRole';

export const useIsEditable = () => {
  const clubMemberRole = getCookieValue('clubMemberRole');

  return clubMemberRole === CLUB_MEMBER_ROLE.회장;
};
