import { API_URL } from '@/data/apiUrl';
import { api } from '@workspace/api/axios';

import { type TokenRefreshResponse } from './type';

export const postTokenRefresh = async () => {
  const { data } = await api.post<TokenRefreshResponse>(
    API_URL.AUTH.TOKEN_REFRESH,
  );

  return data;
};
