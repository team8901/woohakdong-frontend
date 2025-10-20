import { API_URL } from '@/data/apiUrl';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { postRegisterClub } from './post';
import { type RegisterClubRequest, type RegisterClubResponse } from './type';

/** 동아리 등록 mutation */
export const usePostRegisterClubMutation = (
  options?: UseMutationOptions<
    RegisterClubResponse,
    Error,
    RegisterClubRequest
  >,
) => {
  return useMutation({
    mutationKey: [API_URL.CLUB.REGISTER_CLUB],
    mutationFn: (req: RegisterClubRequest) => postRegisterClub(req),
    ...options,
  });
};
