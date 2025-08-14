import { z } from 'zod';

const userInfoSchema = z.object({
  name: z.string().nonempty('이름을 입력해 주세요'),
  email: z.email('이메일을 입력해 주세요'),
  gender: z.enum(['male', 'female'], {
    message: '성별을 선택해 주세요',
  }),
  phone: z
    .string()
    .trim()
    .nonempty('휴대폰 번호를 입력해 주세요')
    .regex(/^01([0|1|6|7|8|9])\d{8}$/, '정확한 휴대폰 번호를 입력해 주세요'),
});

const userSchoolInfoSchema = z.object({
  university: z.string().nonempty('학교를 입력해 주세요'),
  major: z
    .string()
    .trim()
    .nonempty('학과를 입력해 주세요')
    .max(20, '학과는 20자 이하여야 해요'),
  studentNumber: z
    .string()
    .trim()
    .nonempty('학번을 입력해 주세요')
    .max(10, '학번은 10자 이하여야 해요'),
});

export const signUpSchema = userInfoSchema.and(userSchoolInfoSchema);

export type FormData = z.infer<typeof signUpSchema>;
