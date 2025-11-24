import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { API_URL } from '@/data/apiUrl';
import { api } from '@workspace/api/axios';

import { type GetNoticeDetailResponse } from './type';

export const getNoticeDetail = async (clubId: number, noticeId: number) => {
  const url = buildUrlWithParams({
    url: API_URL.NOTICE.RESOURCE,
    pathParams: { clubId, noticeId },
  });

  const { data } = await api.get<GetNoticeDetailResponse>(url);

  return data;
};
