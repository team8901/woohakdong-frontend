import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  type OmittedQueryOptions,
  type OmittedSuspenseQueryOptions,
} from '@workspace/react-query/queryClient';

import { getNoticeDetail } from './fetch';

export const useGetNoticeDetailQuery = (
  clubId: number,
  noticeId: number,
  options?: OmittedQueryOptions,
) => {
  return useQuery({
    queryKey: ['notice', 'detail', clubId, noticeId],
    queryFn: () => getNoticeDetail(clubId, noticeId),
    ...options,
  });
};

export const useGetNoticeDetailSuspenseQuery = (
  clubId: number,
  noticeId: number,
  options?: OmittedSuspenseQueryOptions,
) => {
  return useSuspenseQuery({
    queryKey: ['notice', 'detail', clubId, noticeId],
    queryFn: () => getNoticeDetail(clubId, noticeId),
    ...options,
  });
};
