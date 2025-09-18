import { API_URL } from '@/data/apiUrl';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { postRegisterProfile } from './post';
import {
  type RegisterProfileRequest,
  type RegisterProfileResponse,
} from './type';

/** 유저 프로필 정보 등록 mutation */
export const usePostRegisterProfileMutation = (
  options?: UseMutationOptions<
    RegisterProfileResponse,
    Error,
    RegisterProfileRequest
  >,
) => {
  return useMutation({
    mutationKey: [API_URL.USER.REGISTER_PROFILE],
    mutationFn: (registerRequest: RegisterProfileRequest) =>
      postRegisterProfile(registerRequest),
    ...options,
  });
};
