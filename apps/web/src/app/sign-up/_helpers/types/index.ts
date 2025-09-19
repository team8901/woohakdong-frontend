import type z from 'zod';

import { type userProfileSchema } from '../utils/zodSchemas';

export type UserProfile = {
  nickname: string;
  phoneNumber: string;
  studentId: string;
  gender: 'MALE' | 'FEMALE';
};

export type FormData = z.infer<typeof userProfileSchema>;
