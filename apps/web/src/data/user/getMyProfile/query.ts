import { API_URL } from '@/data/apiUrl';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  type OmittedQueryOptions,
  type OmittedSuspenseQueryOptions,
} from '@workspace/react-query/queryClient';

import { getMyProfile } from './fetch';
import { type MyProfileResponse } from './type';

/* 내 프로필 조회 query */
export const useGetMyProfileQuery = (
  options?: OmittedQueryOptions<MyProfileResponse>,
) => {
  return useQuery({
    queryKey: [API_URL.USER.MY_PROFILE],
    queryFn: () => getMyProfile(),
    ...options,
  });
};

/* 내 프로필 조회 suspense query */
export const useGetMyProfileSuspenseQuery = (
  options?: OmittedSuspenseQueryOptions<MyProfileResponse>,
) => {
  return useSuspenseQuery({
    queryKey: [API_URL.USER.MY_PROFILE],
    queryFn: () => getMyProfile(),
    ...options,
  });
};
