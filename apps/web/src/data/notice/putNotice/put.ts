import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { API_URL } from '@/data/apiUrl';
import { api } from '@workspace/api/axios';

import type { PutNoticeRequest } from './type';

export const putNotice = async (
  clubId: number,
  noticeId: number,
  req: PutNoticeRequest,
) => {
  const url = buildUrlWithParams({
    url: API_URL.NOTICE.RESOURCE,
    pathParams: { clubId, noticeId },
  });

  const { data } = await api.put(url, req);

  return data;
};
