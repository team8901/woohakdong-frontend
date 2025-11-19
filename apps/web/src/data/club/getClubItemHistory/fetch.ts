import { type ApiResponse } from '@/_shared/helpers/types/apiResponse';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { API_URL } from '@/data/apiUrl';
import {
  type ClubItemHistoryRequest,
  type ClubItemHistoryResponse,
} from '@/data/club/getClubItemHistory/type';
import { api } from '@workspace/api/axios';

/** 동아리 물품 대여 내역 조회 */
export const getClubItemHistory = async ({
  clubId,
}: ClubItemHistoryRequest) => {
  const url = buildUrlWithParams({
    url: API_URL.CLUB.CLUB_ITEM_HISTORY,
    pathParams: { clubId },
  });

  const { data } = await api.get<ApiResponse<ClubItemHistoryResponse[]>>(url);

  return data;
};
