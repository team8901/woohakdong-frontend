import { z } from 'zod';
import {
  PHONE_NUMBER_REGEX,
  STUDENT_ID_REGEX,
  NICKNAME_REGEX,
  validateNickname,
  validateStudentId,
  validatePhoneNumber,
} from '../constants';

export const userProfileSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, '닉네임을 입력해 주세요')
    .refine(
      (value) => validateNickname(value),
      '올바른 닉네임 형식이 아니에요',
    ),
  phoneNumber: z
    .string()
    .trim()
    .min(1, '휴대폰 번호를 입력해 주세요')
    .refine(
      (value) => validatePhoneNumber(value),
      '올바른 휴대폰 번호 형식이 아니에요 (예: 010-1234-5678)',
    ),
  studentId: z
    .string()
    .trim()
    .min(1, '학번을 입력해 주세요')
    .refine((value) => validateStudentId(value), '올바른 학번 형식이 아니에요'),
  gender: z.enum(['MALE', 'FEMALE'], {
    message: '성별을 선택해 주세요',
  }),
});

export type FormData = z.infer<typeof userProfileSchema>;
