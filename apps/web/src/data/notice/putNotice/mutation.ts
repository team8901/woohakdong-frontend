import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { putNotice } from './put';
import { type PutNoticeRequest } from './type';

export const usePutNoticeMutation = (
  clubId: number,
  noticeId: number,
  options?: UseMutationOptions<void, Error, PutNoticeRequest>,
) => {
  return useMutation({
    mutationKey: ['notice', 'update', clubId, noticeId],
    mutationFn: (req: PutNoticeRequest) => putNotice(clubId, noticeId, req),
    ...options,
  });
};
