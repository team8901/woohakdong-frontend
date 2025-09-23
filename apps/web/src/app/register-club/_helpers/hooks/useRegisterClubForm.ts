import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';

export const registerClubSchema = z.object({
  clubProfileImageUrl: z.string().trim(),
  clubName: z.string().trim(),
  clubEnglishName: z.string().trim(),
  clubDescription: z.string().trim(),
});

export type RegisterClubFormData = z.infer<typeof registerClubSchema>;

export const useRegisterClubForm = () => {
  const form = useForm<RegisterClubFormData>({
    resolver: zodResolver(registerClubSchema),
    mode: 'onChange',
    defaultValues: {
      clubProfileImageUrl: '',
      clubName: '',
      clubEnglishName: '',
      clubDescription: '',
    },
  });

  return { form };
};
