import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  type OmittedQueryOptions,
  type OmittedSuspenseQueryOptions,
} from '@workspace/react-query/queryClient';

import { getNotices } from './fetch';

export const useGetNoticesQuery = (
  clubId: number,
  options?: OmittedQueryOptions,
) => {
  return useQuery({
    queryKey: ['notice', 'list', clubId],
    queryFn: () => getNotices(clubId),
    ...options,
  });
};

export const useGetNoticesSuspenseQuery = (
  clubId: number,
  options?: OmittedSuspenseQueryOptions,
) => {
  return useSuspenseQuery({
    queryKey: ['notice', 'list', clubId],
    queryFn: () => getNotices(clubId),
    ...options,
  });
};
