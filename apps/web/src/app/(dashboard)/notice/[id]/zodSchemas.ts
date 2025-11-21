import { z } from 'zod';

export const noticePostingSchema = z.object({
  title: z.string().trim().min(1, '제목을 입력해 주세요'),
  content: z.string().trim().min(1, '내용을 입력해 주세요'),
});
