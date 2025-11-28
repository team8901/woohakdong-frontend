import { API_URL } from '@/data/apiUrl';
import { 로그인_성공 } from '@/mock/handlers/auth/postSocialLogin/mockData';
import { type AuthSocialLoginResponse } from '@workspace/api/generated';
import { type MockApiResponse } from '@workspace/msw/types';

export const mockPostSocialLogin = {
  url: API_URL.AUTH.SOCIAL_LOGIN,
  description: '소셜 로그인',
  method: 'post',
  response: {
    로그인_성공: {
      status: 200,
      delayTime: 2000,
      data: 로그인_성공,
    },
  },
} satisfies MockApiResponse<'로그인_성공', AuthSocialLoginResponse>;
