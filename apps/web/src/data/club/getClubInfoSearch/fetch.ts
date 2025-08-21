import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { API_URL } from '@/data/apiUrl';
import {
  type ClubInfoSearchRequest,
  type ClubInfoSearchResponse,
} from '@/data/club/getClubInfoSearch/type';
import { api } from '@workspace/api/axios';

/** 동아리 정보 검색 */
export const getClubInfoSearch = async ({
  name,
  nameEn,
}: ClubInfoSearchRequest) => {
  const url = buildUrlWithParams({
    url: API_URL.CLUB.CLUB_INFO_SEARCH,
    queryParams: { name, nameEn },
  });

  const { data } = await api.get<ClubInfoSearchResponse>(url);

  return data;
};
