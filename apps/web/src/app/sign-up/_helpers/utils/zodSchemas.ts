import { z } from 'zod';

export const userProfileSchema = z.object({
  nickname: z
    .string()
    .trim()
    .nonempty('닉네임을 입력해 주세요')
    .max(20, '20자 이내로 입력해 주세요'),
  phoneNumber: z
    .string()
    .trim()
    .nonempty('휴대폰 번호를 입력해 주세요')
    .regex(
      /^01([0|1|6|7|8|9]?)-([0-9]{3,4})-([0-9]{4})$/,
      '정확한 휴대폰 번호를 입력해 주세요',
    ),
  studentId: z
    .string()
    .trim()
    .nonempty('학번을 입력해 주세요')
    .max(10, '10자 이내로 입력해 주세요'),
  gender: z.enum(['MALE', 'FEMALE'], {
    message: '성별을 선택해 주세요',
  }),
});

export type FormData = z.infer<typeof userProfileSchema>;
