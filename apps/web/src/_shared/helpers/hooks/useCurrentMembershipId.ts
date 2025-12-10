import { getCookieValue } from '@/_shared/helpers/utils/getCookieValue';

export const useCurrentMembershipId = (): number | undefined => {
  const clubMembershipId = getCookieValue('clubMembershipId');

  return clubMembershipId ? Number(clubMembershipId) : undefined;
};
