export type SocialLoginRequest = {
  /** 소셜 로그인 제공자 */
  provider: string;
  /** Firebase Id Token */
  providerAccessToken: string;
};

/** 소셜 로그인 response */
export type SocialLoginResponse = {
  /** 액세스 토큰 */
  accessToken: string;
};
