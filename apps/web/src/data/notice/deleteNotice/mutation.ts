import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { deleteNotice } from './delete';

export const useDeleteNoticeMutation = (
  clubId: number,
  options?: UseMutationOptions<void, Error, number>,
) => {
  return useMutation({
    mutationKey: ['notice', 'delete', clubId],
    mutationFn: (noticeId: number) => deleteNotice(clubId, noticeId),
    ...options,
  });
};
