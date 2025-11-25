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
    mutationKey: ['/api/clubs'],
    mutationFn: (req: ClubRegisterRequest) => registerNewClub(req),
    ...options,
  });
};
