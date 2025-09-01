import { API_URL } from '@/data/apiUrl';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { postTokenRefresh } from './fetch';
import { type TokenRefreshResponse } from './type';

export const usePostTokenRefreshMutation = (
  options?: UseMutationOptions<TokenRefreshResponse, Error>,
) => {
  return useMutation({
    mutationKey: [API_URL.AUTH.TOKEN_REFRESH],
    mutationFn: () => postTokenRefresh(),
    ...options,
  });
};
