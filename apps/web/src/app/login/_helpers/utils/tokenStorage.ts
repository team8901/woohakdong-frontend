export type StoreTokenRequest = {
  accessToken: string;
  refreshToken: string;
};

export type StoreTokenResponse = {
  success: boolean;
  message: string;
};

/**
 * HTTP Only 쿠키에 토큰을 저장하는 함수
 * @param tokens - 저장할 액세스 토큰과 리프레시 토큰
 * @returns 저장 결과
 * @throws 토큰 저장 실패 시 에러
 */
export const storeTokensInCookie = async (
  tokens: StoreTokenRequest,
): Promise<StoreTokenResponse> => {
  const { accessToken, refreshToken } = tokens;

  if (!accessToken || !refreshToken) {
    throw new Error('AccessToken과 RefreshToken이 모두 필요합니다.');
  }

  try {
    const response = await fetch('/api/auth/store-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken,
        refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('토큰 저장에 실패했습니다.');
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message || '토큰이 성공적으로 저장되었습니다.',
    };
  } catch (error) {
    console.error('토큰 저장 오류:', error);
    throw error;
  }
};

/**
 * 토큰 저장과 axios 인스턴스 설정을 함께 처리하는 함수
 * @param tokens - 저장할 토큰 정보
 * @param setAuthToken - axios 인스턴스에 토큰을 설정하는 함수
 * @returns 저장 결과
 */
export const storeAndSetTokens = async (
  tokens: StoreTokenRequest,
  setAuthToken: (token: string) => void,
): Promise<StoreTokenResponse> => {
  // HTTP Only 쿠키에 토큰 저장
  const result = await storeTokensInCookie(tokens);

  // axios 인스턴스에 토큰 설정
  setAuthToken(tokens.accessToken);

  return result;
};
