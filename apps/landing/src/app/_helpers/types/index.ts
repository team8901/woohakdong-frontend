import { type z } from 'zod';

import { type preRegistrationInfoSchema } from '../utils/zodSchemas';

export type PreRegistrationInfoFormData = z.infer<
  typeof preRegistrationInfoSchema
>;
