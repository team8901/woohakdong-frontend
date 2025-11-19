import { type ApiResponse } from '@/_shared/helpers/types/apiResponse';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { API_URL } from '@/data/apiUrl';
import {
  type ClubItemRequest,
  type ClubItemResponse,
} from '@/data/club/getClubItems/type';
import { api } from '@workspace/api/axios';

/** 동아리 물품 조회 */
export const getClubItems = async ({
  clubId,
  keyword,
  category,
}: ClubItemRequest) => {
  const url = buildUrlWithParams({
    url: API_URL.CLUB.CLUB_ITEMS,
    pathParams: { clubId },
    queryParams: { keyword, category },
  });

  const { data } = await api.get<ApiResponse<ClubItemResponse[]>>(url);

  return data;
};
