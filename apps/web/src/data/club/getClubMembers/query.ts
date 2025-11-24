import { type ApiResponse } from '@/_shared/helpers/types/apiResponse';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { API_URL } from '@/data/apiUrl';
import { getClubMembers } from '@/data/club/getClubMembers/fetch';
import {
  type ClubMembersRequest,
  type ClubMembersResponse,
} from '@/data/club/getClubMembers/type';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  type OmittedQueryOptions,
  type OmittedSuspenseQueryOptions,
} from '@workspace/react-query/queryClient';

/** 동아리 회원 목록 query */
export const useGetClubMembersQuery = (
  { clubId }: ClubMembersRequest,
  options?: OmittedQueryOptions,
) => {
  const url = buildUrlWithParams({
    url: API_URL.CLUB.CLUB_MEMBERS,
    pathParams: { clubId },
  });

  return useQuery({
    queryKey: [url],
    queryFn: () => getClubMembers({ clubId }),
    ...options,
  });
};

/** 동아리 회원 목록 suspense query */
export const useGetClubMembersSuspenseQuery = (
  { clubId }: ClubMembersRequest,
  options?: OmittedSuspenseQueryOptions<ApiResponse<ClubMembersResponse[]>>,
) => {
  const url = buildUrlWithParams({
    url: API_URL.CLUB.CLUB_MEMBERS,
    pathParams: { clubId },
  });

  return useSuspenseQuery({
    queryKey: [url],
    queryFn: () => getClubMembers({ clubId }),
    ...options,
  });
};
