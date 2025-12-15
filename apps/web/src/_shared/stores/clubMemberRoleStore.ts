import { getCookieValue } from '@/_shared/helpers/utils/getCookieValue';
import { type ClubMemberRole } from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/clubMemberRole';

const listeners = new Set<() => void>();

/**
 * 쿠키에 저장된 clubMemberRole을 React 상태로 동기화하는 store
 * @see https://react.dev/reference/react/useSyncExternalStore
 */
export const clubMemberRoleStore = {
  subscribe: (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
  },

  getSnapshot: () => {
    return getCookieValue('clubMemberRole') as ClubMemberRole | undefined;
  },

  getServerSnapshot: () => {
    return undefined;
  },

  notify: () => {
    listeners.forEach((callback) => callback());
  },
};
