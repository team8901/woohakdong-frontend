import { API_URL } from '@/data/apiUrl';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  getMyProfile,
  type UserProfileResponse,
} from '@workspace/api/generated';
import {
  type OmittedQueryOptions,
  type OmittedSuspenseQueryOptions,
} from '@workspace/react-query/queryClient';

/** 내 프로필 조회 query */
export const useGetMyProfileQuery = (
  options?: OmittedQueryOptions<UserProfileResponse>,
) => {
  return useQuery({
    queryKey: [API_URL.USER.MY_PROFILE],
    queryFn: () => getMyProfile(),
    ...options,
  });
};

/** 내 프로필 조회 suspense query */
export const useGetMyProfileSuspenseQuery = (
  options?: OmittedSuspenseQueryOptions<UserProfileResponse>,
) => {
  return useSuspenseQuery({
    queryKey: [API_URL.USER.MY_PROFILE],
    queryFn: () => getMyProfile(),
    ...options,
  });
};
