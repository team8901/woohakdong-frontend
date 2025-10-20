import { API_URL } from '@/data/apiUrl';
import {
  type RegisterClubRequest,
  type RegisterClubResponse,
} from '@/data/club/postRegisterClub/type';
import { api } from '@workspace/api/axios';

/** 동아리 등록 */
export const postRegisterClub = async (req: RegisterClubRequest) => {
  const { data } = await api.post<RegisterClubResponse>(
    API_URL.CLUB.REGISTER_CLUB,
    req,
  );

  return data;
};
