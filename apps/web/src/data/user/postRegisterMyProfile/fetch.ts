import { API_URL } from '@/data/apiUrl';
import { api } from '@workspace/api/axios';

import {
  type RegsiterMyProfileRequest,
  type RegsiterMyProfileResponse,
} from './type';

export const postRegisterMyProfile = async ({
  nickname,
  phoneNumber,
  studentId,
  gender,
}: RegsiterMyProfileRequest): Promise<RegsiterMyProfileResponse> => {
  const { data } = await api.post<RegsiterMyProfileResponse>(
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
