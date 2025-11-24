import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { API_URL } from '@/data/apiUrl';
import { api } from '@workspace/api/axios';

import type { PostNoticeRequest, PostNoticeResponse } from './type';

export const postNotice = async (clubId: number, req: PostNoticeRequest) => {
  const url = buildUrlWithParams({
    url: API_URL.NOTICE.COLLECTION,
    pathParams: { clubId },
  });

  const { data } = await api.post<PostNoticeResponse>(url, req);

  return data;
};
