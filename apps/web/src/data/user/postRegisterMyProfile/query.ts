import { API_URL } from '@/data/apiUrl';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { postRegisterMyProfile } from './fetch';
import {
  type RegisterMyProfileRequest,
  type RegisterMyProfileResponse,
} from './type';

/** 유저 프로필 정보 등록 mutation */
export const usePostRegisterMyProfileMutation = (
  options?: UseMutationOptions<
    RegisterMyProfileResponse,
    Error,
    RegisterMyProfileRequest
  >,
) => {
  return useMutation({
    mutationKey: [API_URL.USER.REGISTER_MY_PROFILE],
    mutationFn: (registerRequest: RegisterMyProfileRequest) =>
      postRegisterMyProfile(registerRequest),
    ...options,
  });
};
