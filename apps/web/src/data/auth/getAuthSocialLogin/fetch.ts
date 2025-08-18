import { API_URL } from '@/data/apiUrl';
import {
  AuthSocialLoginRequest,
  AuthSocialLoginResponse,
} from '@/data/auth/getAuthSocialLogin/type';
import { api } from '@workspace/api/axios';

/** 소셜 로그인 후, AccessToken 및 RefreshToken 발급 */
export const getAuthSocialLogin = async ({
  provider,
  providerAccessToken,
}: AuthSocialLoginRequest): Promise<AuthSocialLoginResponse> => {
  const { data } = await api.post<AuthSocialLoginResponse>(
    API_URL.AUTH.SOCIAL_LOGIN,
    {
      provider,
      providerAccessToken,
    },
  );

  return data;
};
