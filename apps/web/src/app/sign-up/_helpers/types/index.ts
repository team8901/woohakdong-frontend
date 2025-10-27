import { type z } from 'zod';

import { type userProfileSchema } from '../utils/zodSchemas';

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
