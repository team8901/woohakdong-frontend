import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { API_URL } from '@/data/apiUrl';
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
  const url = buildUrlWithParams({
    url: API_URL.CLUB.CLUB_INFO_SEARCH,
    queryParams: params,
  });

  return useQuery({
    queryKey: [url],
    queryFn: () => searchClubs(params),
    ...options,
  });
};

/** 동아리 정보 검색 suspense query */
export const useGetClubInfoSearchSuspenseQuery = (
  params: SearchClubsParams = {},
  options?: OmittedSuspenseQueryOptions<ListWrapperClubInfoResponse>,
) => {
  const url = buildUrlWithParams({
    url: API_URL.CLUB.CLUB_INFO_SEARCH,
    queryParams: params,
  });

  return useSuspenseQuery({
    queryKey: [url],
    queryFn: () => searchClubs(params),
    ...options,
  });
};
