import { API_URL } from '@/data/apiUrl';
import { api } from '@workspace/api/axios';

import { type MyProfileResponse } from './type';

export const getMyProfile = async () => {
  const { data } = await api.get<MyProfileResponse>(API_URL.USER.MY_PROFILE);

  return data;
};
