import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { API_URL } from '@/data/apiUrl';
import { api } from '@workspace/api/axios';

import { type GetNoticesResponse } from './type';

export const getNotices = async (clubId: number) => {
  const url = buildUrlWithParams({
    url: API_URL.NOTICE.COLLECTION,
    pathParams: { clubId },
  });

  const { data } = await api.get<GetNoticesResponse>(url);

  return data;
};
