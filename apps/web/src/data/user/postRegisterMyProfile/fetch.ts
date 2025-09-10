import { API_URL } from '@/data/apiUrl';
import { api } from '@workspace/api/axios';

import {
  type RegisterMyProfileRequest,
  type RegisterMyProfileResponse,
} from './type';

export const postRegisterMyProfile = async ({
  nickname,
  phoneNumber,
  studentId,
  gender,
}: RegisterMyProfileRequest): Promise<RegisterMyProfileResponse> => {
  const { data } = await api.post<RegisterMyProfileResponse>(
    API_URL.USER.REGISTER_MY_PROFILE,
    {
      nickname,
      phoneNumber,
      studentId,
      gender,
    },
  );

  return data;
};
