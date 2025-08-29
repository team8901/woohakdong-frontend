import { API_URL } from '@/data/apiUrl';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { getSocialLogin } from './fetch';
import { type SocialLoginRequest, type SocialLoginResponse } from './type';

export const useGetSocialLoginMutation = (
  options?: UseMutationOptions<SocialLoginResponse, Error, SocialLoginRequest>,
) => {
  return useMutation({
    mutationKey: [API_URL.AUTH.SOCIAL_LOGIN],
    mutationFn: getSocialLogin,
    retry: false,
    ...options,
  });
};
