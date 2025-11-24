import { type ApiResponse } from '@/_shared/helpers/types/apiResponse';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { API_URL } from '@/data/apiUrl';
import { getClubItemHistory } from '@/data/club/getClubItemHistory/fetch';
import {
  type ClubItemHistoryRequest,
  type ClubItemHistoryResponse,
} from '@/data/club/getClubItemHistory/type';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  type OmittedQueryOptions,
  type OmittedSuspenseQueryOptions,
} from '@workspace/react-query/queryClient';

/** 동아리 물품 대여 내역 조회 query */
export const useGetClubItemHistoryQuery = (
  { clubId }: ClubItemHistoryRequest,
  options?: OmittedQueryOptions,
) => {
  const url = buildUrlWithParams({
    url: API_URL.CLUB.CLUB_ITEM_HISTORY,
    pathParams: { clubId },
  });

  return useQuery({
    queryKey: [url],
    queryFn: () => getClubItemHistory({ clubId }),
    ...options,
  });
};

/** 동아리 물품 대여 내역 조회 suspense query */
export const useGetClubItemHistorySuspenseQuery = (
  { clubId }: ClubItemHistoryRequest,
  options?: OmittedSuspenseQueryOptions<ApiResponse<ClubItemHistoryResponse[]>>,
) => {
  const url = buildUrlWithParams({
    url: API_URL.CLUB.CLUB_ITEM_HISTORY,
    pathParams: { clubId },
  });

  return useSuspenseQuery({
    queryKey: [url],
    queryFn: () => getClubItemHistory({ clubId }),
    ...options,
  });
};
