import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { API_URL } from '@/data/apiUrl';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  getClubMembers,
  type ListWrapperClubMembershipResponse,
} from '@workspace/api/generated';
import {
  type OmittedQueryOptions,
  type OmittedSuspenseQueryOptions,
} from '@workspace/react-query/queryClient';

/** 동아리 회원 목록 query */
export const useGetClubMembersQuery = (
  { clubId }: { clubId: number },
  options?: OmittedQueryOptions<ListWrapperClubMembershipResponse>,
) => {
  const url = buildUrlWithParams({
    url: API_URL.CLUB.CLUB_MEMBERS,
    pathParams: { clubId },
  });

  return useQuery({
    queryKey: [url],
    queryFn: () => getClubMembers(clubId),
    ...options,
  });
};

/** 동아리 회원 목록 suspense query */
export const useGetClubMembersSuspenseQuery = (
  { clubId }: { clubId: number },
  options?: OmittedSuspenseQueryOptions<ListWrapperClubMembershipResponse>,
) => {
  const url = buildUrlWithParams({
    url: API_URL.CLUB.CLUB_MEMBERS,
    pathParams: { clubId },
  });

  return useSuspenseQuery({
    queryKey: [url],
    queryFn: () => getClubMembers(clubId),
    ...options,
  });
};
