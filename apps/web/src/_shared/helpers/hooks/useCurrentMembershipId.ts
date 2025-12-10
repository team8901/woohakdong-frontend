'use client';

const getCookieValue = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;

  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));

  return match?.[2] ? decodeURIComponent(match[2]) : undefined;
};

export const useCurrentMembershipId = (): number | undefined => {
  const clubMembershipId = getCookieValue('clubMembershipId');

  return clubMembershipId ? Number(clubMembershipId) : undefined;
};
