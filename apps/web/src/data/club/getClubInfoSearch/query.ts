import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  type ListWrapperClubInfoResponse,
  searchClubs,
  type SearchClubsParams,
} from '@workspace/api/generated';
import {
  type OmittedQueryOptions,
  type OmittedSuspenseQueryOptions,
} from '@workspace/react-query/queryClient';

/** 동아리 정보 검색 query */
export const useGetClubInfoSearchQuery = (
  params: SearchClubsParams = {},
  options?: OmittedQueryOptions<ListWrapperClubInfoResponse>,
) => {
  return useQuery({
    queryKey: ['/api/clubs/search', params],
    queryFn: () => searchClubs(params),
    ...options,
  });
};

/** 동아리 정보 검색 suspense query */
export const useGetClubInfoSearchSuspenseQuery = (
  params: SearchClubsParams = {},
  options?: OmittedSuspenseQueryOptions<ListWrapperClubInfoResponse>,
) => {
  return useSuspenseQuery({
    queryKey: ['/api/clubs/search', params],
    queryFn: () => searchClubs(params),
    ...options,
  });
};
