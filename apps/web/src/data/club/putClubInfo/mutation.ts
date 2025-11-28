import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { API_URL } from '@/data/apiUrl';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import {
  type ClubUpdateRequest,
  updateClubInfo,
} from '@workspace/api/generated';

type UpdateClubInfoParams = {
  data: ClubUpdateRequest;
};

/** 동아리 정보 수정 mutation */
export const usePutClubInfoMutation = (
  clubId: number,
  options?: UseMutationOptions<void, Error, UpdateClubInfoParams>,
) => {
  const url = buildUrlWithParams({
    url: API_URL.CLUB.UPDATE_CLUB_INFO,
    pathParams: { clubId },
  });

  return useMutation({
    mutationKey: [url],
    mutationFn: ({ data }: UpdateClubInfoParams) => {
      return updateClubInfo(clubId, data);
    },
    ...options,
  });
};
