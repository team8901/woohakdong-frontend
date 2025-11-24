import { type ApiResponse } from '@/_shared/helpers/types/apiResponse';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { API_URL } from '@/data/apiUrl';
import {
  type ClubMembersRequest,
  type ClubMembersResponse,
} from '@/data/club/getClubMembers/type';
import { api } from '@workspace/api/axios';

/** 동아리 회원 목록 */
export const getClubMembers = async ({ clubId }: ClubMembersRequest) => {
  const url = buildUrlWithParams({
    url: API_URL.CLUB.CLUB_MEMBERS,
    pathParams: { clubId },
  });

  const { data } = await api.get<ApiResponse<ClubMembersResponse[]>>(url);

  return data;
};
