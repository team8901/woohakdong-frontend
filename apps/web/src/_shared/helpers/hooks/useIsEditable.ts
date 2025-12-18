import { useSyncExternalStore } from 'react';

import { clubMemberRoleStore } from '@/_shared/stores/clubMemberRoleStore';
import { CLUB_MEMBER_ROLE } from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/clubMemberRole';

export const useIsEditable = () => {
  const clubMemberRole = useSyncExternalStore(
    clubMemberRoleStore.subscribe,
    clubMemberRoleStore.getSnapshot,
    clubMemberRoleStore.getServerSnapshot,
  );

  return clubMemberRole === CLUB_MEMBER_ROLE.회장;
};
