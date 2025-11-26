import { API_URL } from '@/data/apiUrl';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import {
  type AuthSocialLoginRequest,
  type AuthSocialLoginResponse,
  socialLogin,
} from '@workspace/api/generated';

/** 소셜 로그인 mutation */
export const usePostSocialLoginMutation = (
  options?: UseMutationOptions<
    AuthSocialLoginResponse,
    Error,
    AuthSocialLoginRequest
  >,
) => {
  return useMutation({
    mutationKey: [API_URL.AUTH.SOCIAL_LOGIN],
    mutationFn: (loginRequest: AuthSocialLoginRequest) =>
      socialLogin(loginRequest),
    ...options,
  });
};
