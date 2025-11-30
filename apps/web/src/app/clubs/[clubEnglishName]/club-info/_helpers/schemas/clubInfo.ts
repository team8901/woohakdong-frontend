import z from 'zod';

export const clubInfoSchema = z.object({
  clubProfileImage: z.instanceof(File).optional(),
  clubName: z
    .string()
    .trim()
    .min(1, '동아리 이름을 입력해주세요')
    .max(20, '동아리 이름은 최대 20자까지 입력 가능해요'),
  clubEnglishName: z
    .string()
    .trim()
    .min(1, '동아리 영문명을 입력해주세요')
    .max(20, '동아리 영문명은 최대 20자까지 입력 가능해요')
    .regex(/^[a-zA-Z0-9\s]*$/, '동아리 영문명은 영어, 숫자만 입력 가능해요'),
  clubDescription: z
    .string()
    .trim()
    .min(1, '동아리 설명을 입력해주세요')
    .max(500, '동아리 설명은 최대 500자까지 입력 가능해요'),
});

export type ClubInfoFormData = z.infer<typeof clubInfoSchema>;
