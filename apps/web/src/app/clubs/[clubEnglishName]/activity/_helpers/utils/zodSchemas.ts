import { z } from 'zod';

export const activityPostingSchema = z.object({
  title: z.string().trim().min(1, '제목을 입력해 주세요'),
  content: z.string().trim().min(1, '내용을 입력해 주세요'),
  participantCount: z
    .string()
    .trim()
    .min(1, '최소 한 명 이상 입력해 주세요')
    .refine((val) => {
      const num = parseInt(val, 10);

      return !isNaN(num) && num >= 1;
    }, '최소 한 명 이상 입력해 주세요'),
  activityDate: z.string().min(1, '활동 날짜를 선택해 주세요'),
  tag: z.enum(['STUDY', 'PARTY', 'MEETING', 'MT', 'ETC'], {
    message: '태그를 선택해 주세요',
  }),
  activityImages: z.instanceof(File).optional(),
});
