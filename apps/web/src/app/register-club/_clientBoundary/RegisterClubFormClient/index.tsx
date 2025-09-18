'use client';

import { useForm } from 'react-hook-form';

import { RegisterClubCardContent } from '@/app/register-club/_components/RegisterClubCardContent';
import { RegisterClubCardFooter } from '@/app/register-club/_components/RegisterClubCardFooter';
import { zodResolver } from '@hookform/resolvers/zod';
import { CardContent, CardFooter } from '@workspace/ui/components/card';
import { Form } from '@workspace/ui/components/form';
import z from 'zod';

// TODO: zod 스키마 구현 및 사용
export const registerClubSchema = z.object({
  clubLogoImageUrl: z.string().trim(),
  clubName: z.string().trim(),
  clubEnglishName: z.string().trim(),
  clubDescription: z.string().trim(),
});

export type RegisterClubFormData = z.infer<typeof registerClubSchema>;

export const RegisterClubFormClient = () => {
  // TODO: useRegisterClubFormFlow 훅 구현 및 사용
  const form = useForm<RegisterClubFormData>({
    resolver: zodResolver(registerClubSchema),
    mode: 'onChange',
    defaultValues: {
      clubLogoImageUrl: '',
      clubName: '',
      clubEnglishName: '',
      clubDescription: '',
    },
  });

  return (
    <Form {...form}>
      <form>
        <div className="flex flex-col gap-6">
          <CardContent>
            <RegisterClubCardContent form={form} />
          </CardContent>

          <CardFooter>
            <RegisterClubCardFooter />
          </CardFooter>
        </div>
      </form>
    </Form>
  );
};
