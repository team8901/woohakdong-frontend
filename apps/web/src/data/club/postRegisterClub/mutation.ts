import { API_URL } from '@/data/apiUrl';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import {
  type ClubIdResponse,
  type ClubRegisterRequest,
  registerNewClub,
} from '@workspace/api/generated';

/** 동아리 등록 mutation */
export const usePostRegisterClubMutation = (
  options?: UseMutationOptions<ClubIdResponse, Error, ClubRegisterRequest>,
) => {
  return useMutation({
    mutationKey: [API_URL.CLUB.REGISTER_CLUB],
    mutationFn: (req: ClubRegisterRequest) => registerNewClub(req),
    ...options,
  });
};
