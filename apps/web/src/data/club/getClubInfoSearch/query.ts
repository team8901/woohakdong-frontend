import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { API_URL } from '@/data/apiUrl';
import { getClubInfoSearch } from '@/data/club/getClubInfoSearch/fetch';
import {
  type ClubInfoSearchRequest,
  type ClubInfoSearchResponse,
} from '@/data/club/getClubInfoSearch/type';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  type OmittedQueryOptions,
  type OmittedSuspenseQueryOptions,
} from '@workspace/react-query/queryClient';

/** 동아리 정보 검색 query */
export const useGetClubInfoSearchQuery = (
  { name, nameEn }: ClubInfoSearchRequest,
  options?: OmittedQueryOptions,
) => {
  const url = buildUrlWithParams({
    url: API_URL.CLUB.CLUB_INFO_SEARCH,
    queryParams: { name, nameEn },
  });

  return useQuery({
    queryKey: [url],
    queryFn: () => getClubInfoSearch({ name, nameEn }),
    ...options,
  });
};

/** 동아리 정보 검색 suspense query */
export const useGetClubInfoSearchSuspenseQuery = (
  { name, nameEn }: ClubInfoSearchRequest,
  options?: OmittedSuspenseQueryOptions<ClubInfoSearchResponse>,
) => {
  const url = buildUrlWithParams({
    url: API_URL.CLUB.CLUB_INFO_SEARCH,
    queryParams: { name, nameEn },
  });

  return useSuspenseQuery({
    queryKey: [url],
    queryFn: () => getClubInfoSearch({ name, nameEn }),
    ...options,
  });
};
