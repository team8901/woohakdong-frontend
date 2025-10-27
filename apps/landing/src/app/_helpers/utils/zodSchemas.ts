import { z } from 'zod';

import { validateEmail, validateSchoolName } from './validators';

export const preRegistrationInfoSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, '이메일을 입력해 주세요')
    .refine((value) => validateEmail(value), '올바른 이메일 형식이 아니에요'),
  schoolName: z
    .string()
    .trim()
    .min(1, '대학명을 입력해 주세요')
    .refine((value) => validateSchoolName(value), '올바른 대학명이 아니에요'),
  clubCategory: z.enum(
    [
      '친목',
      '봉사',
      '운동',
      '여행',
      '음악',
      '게임',
      '예술',
      '공예',
      '언어',
      '미디어',
      '학술',
      '반려동물',
      '종교',
      '기타',
    ],
    {
      message: '동아리 카테고리를 선택해 주세요',
    },
  ),
});
