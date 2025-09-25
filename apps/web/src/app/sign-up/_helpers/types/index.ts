import { type UseFormReturn } from 'react-hook-form';

import { type z } from 'zod';

import { type userProfileSchema } from '../utils/zodSchemas';

export type UserProfile = {
  nickname: string;
  phoneNumber: string;
  studentId: string;
  gender: 'MALE' | 'FEMALE';
};

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

export type SignupCardContentProps = {
  form: UseFormReturn<UserProfileFormData>;
};

export type SignupCardFooterProps = {
  onQuit: () => Promise<void>;
  isFormValid: boolean;
  isSubmitting: boolean;
};
