import { API_URL } from '@/data/apiUrl';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import {
  createNewProfile,
  type UserProfileCreateRequest,
  type UserProfileIdResponse,
} from '@workspace/api/generated';

/** 유저 프로필 정보 등록 mutation */
export const usePostRegisterProfileMutation = (
  options?: UseMutationOptions<
    UserProfileIdResponse,
    Error,
    UserProfileCreateRequest
  >,
) => {
  return useMutation({
    mutationKey: [API_URL.USER.REGISTER_PROFILE],
    mutationFn: (registerRequest: UserProfileCreateRequest) =>
      createNewProfile(registerRequest),
    ...options,
  });
};
