import { API_URL } from '@/data/apiUrl';
import {
  type SocialLoginRequest,
  type SocialLoginResponse,
} from '@/data/auth/getSocialLogin/type';
import { api } from '@workspace/api/axios';

/** 소셜 로그인 후, AccessToken 발급 (RefreshToken은 HttpOnly Cookie로 받음) */
export const getSocialLogin = async ({
  provider,
  providerAccessToken,
}: SocialLoginRequest): Promise<SocialLoginResponse> => {
  const { data } = await api.post<SocialLoginResponse>(
    API_URL.AUTH.SOCIAL_LOGIN,
    {
      provider,
      providerAccessToken,
    },
  );

  return data;
};
