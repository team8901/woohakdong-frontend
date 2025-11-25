import { API_URL } from '@/data/apiUrl';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  getJoinedClubs,
  type ListWrapperClubInfoResponse,
} from '@workspace/api/generated';
import {
  type OmittedQueryOptions,
  type OmittedSuspenseQueryOptions,
} from '@workspace/react-query/queryClient';

/** 내가 가입한 동아리 목록 조회 query */
export const useGetJoinedClubsQuery = (
  options?: OmittedQueryOptions<ListWrapperClubInfoResponse>,
) => {
  return useQuery({
    queryKey: [API_URL.CLUB.GET_JOINED_CLUBS],
    queryFn: () => getJoinedClubs(),
    ...options,
  });
};

/** 내가 가입한 동아리 목록 조회 suspense query */
export const useGetJoinedClubsSuspenseQuery = (
  options?: OmittedSuspenseQueryOptions<ListWrapperClubInfoResponse>,
) => {
  return useSuspenseQuery({
    queryKey: [API_URL.CLUB.GET_JOINED_CLUBS],
    queryFn: () => getJoinedClubs(),
    ...options,
  });
};
