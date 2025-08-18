export type AuthSocialLoginRequest = {
  /** 소셜 로그인 제공자 */
  provider: string;
  /** 소셜 로그인 제공자 액세스 토큰 */
  providerAccessToken: string;
};

/** 소셜 로그인 response */
export type AuthSocialLoginResponse = {
  /** access token */
  accessToken: string;
  /** refresh token */
  refreshToken: string;
};
