'use client';

import { RegisterClubCardContent } from '@/app/register-club/_components/RegisterClubCardContent';
import { RegisterClubCardFooter } from '@/app/register-club/_components/RegisterClubCardFooter';
import { useRegisterClubForm } from '@/app/register-club/_helpers/hooks/useRegisterClubForm';
import { CardContent, CardFooter } from '@workspace/ui/components/card';
import { Form } from '@workspace/ui/components/form';

export const RegisterClubFormClient = () => {
  // TODO: isFormValid, isSubmitting, onQuit, onSubmit 추가
  const { form } = useRegisterClubForm();

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()}>
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
