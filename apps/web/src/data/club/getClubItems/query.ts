import { type ApiResponse } from '@/_shared/helpers/types/apiResponse';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { API_URL } from '@/data/apiUrl';
import { getClubItems } from '@/data/club/getClubItems/fetch';
import {
  type ClubItemRequest,
  type ClubItemResponse,
} from '@/data/club/getClubItems/type';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  type OmittedQueryOptions,
  type OmittedSuspenseQueryOptions,
} from '@workspace/react-query/queryClient';

/** 동아리 물품 조회 query */
export const useGetClubItemsQuery = (
  { clubId, keyword, category }: ClubItemRequest,
  options?: OmittedQueryOptions,
) => {
  const url = buildUrlWithParams({
    url: API_URL.CLUB.CLUB_ITEMS,
    pathParams: { clubId },
    queryParams: { keyword, category },
  });

  return useQuery({
    queryKey: [url],
    queryFn: () => getClubItems({ clubId, keyword, category }),
    ...options,
  });
};

/** 동아리 물품 조회 suspense query */
export const useGetClubItemsSuspenseQuery = (
  { clubId, keyword, category }: ClubItemRequest,
  options?: OmittedSuspenseQueryOptions<ApiResponse<ClubItemResponse[]>>,
) => {
  const url = buildUrlWithParams({
    url: API_URL.CLUB.CLUB_ITEMS,
    pathParams: { clubId },
    queryParams: { keyword, category },
  });

  return useSuspenseQuery({
    queryKey: [url],
    queryFn: () => getClubItems({ clubId, keyword, category }),
    ...options,
  });
};
