import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { postNotice } from './post';
import { type PostNoticeRequest, type PostNoticeResponse } from './type';

export const usePostNoticeMutation = (
  clubId: number,
  options?: UseMutationOptions<PostNoticeResponse, Error, PostNoticeRequest>,
) => {
  return useMutation({
    mutationKey: ['notice', 'create', clubId],
    mutationFn: (req: PostNoticeRequest) => postNotice(clubId, req),
    ...options,
  });
};
