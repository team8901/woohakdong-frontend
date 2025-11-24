import { API_URL } from '@/data/apiUrl';
import { api } from '@workspace/api/axios';

import {
  type RegisterProfileRequest,
  type RegisterProfileResponse,
} from './type';

export const postRegisterProfile = async (req: RegisterProfileRequest) => {
  const { data } = await api.post<RegisterProfileResponse>(
    API_URL.USER.REGISTER_PROFILE,
    req,
  );

  return data;
};
