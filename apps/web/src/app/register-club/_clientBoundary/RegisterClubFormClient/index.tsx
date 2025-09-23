'use client';

import { RegisterClubCardContent } from '@/app/register-club/_components/RegisterClubCardContent';
import { RegisterClubCardFooter } from '@/app/register-club/_components/RegisterClubCardFooter';
import { useRegisterClubForm } from '@/app/register-club/_helpers/hooks/useRegisterClubForm';
import { CardContent, CardFooter } from '@workspace/ui/components/card';
import { Form } from '@workspace/ui/components/form';

export const RegisterClubFormClient = () => {
  const {
    form,
    isFormValid,
    isSubmitting,
    imagePreviewUrl,
    onGoBack,
    onSubmit,
    onChangeImage,
  } = useRegisterClubForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <CardContent>
            <RegisterClubCardContent
              form={form}
              imagePreviewUrl={imagePreviewUrl}
              onChangeImage={onChangeImage}
            />
          </CardContent>

          <CardFooter>
            <RegisterClubCardFooter
              isFormValid={isFormValid}
              isSubmitting={isSubmitting}
              onGoBack={onGoBack}
            />
          </CardFooter>
        </div>
      </form>
    </Form>
  );
};
