import { API_URL } from '@/data/apiUrl';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { postSocialLogin } from './post';
import { type SocialLoginRequest, type SocialLoginResponse } from './type';

export const usePostSocialLoginMutation = (
  options?: UseMutationOptions<SocialLoginResponse, Error, SocialLoginRequest>,
) => {
  return useMutation({
    mutationKey: [API_URL.AUTH.SOCIAL_LOGIN],
    mutationFn: (req: SocialLoginRequest) => postSocialLogin(req),
    ...options,
  });
};
