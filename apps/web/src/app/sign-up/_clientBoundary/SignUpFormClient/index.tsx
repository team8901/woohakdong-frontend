'use client';

import { SignUpCardFooter } from '../../_components/SignUpCardFooter';
import { useSignUpForm } from '../../_helpers/hooks/useSignUpForm';
import { Form } from '@workspace/ui/components/form';
import { CardContent, CardFooter } from '@workspace/ui/components/card';
import { SignUpCardContent } from '../../_components/SignUpCardContent';

export const SignUpFormClient = () => {
  const { form, isFormValid, isSubmitting, onQuit, onSubmit } = useSignUpForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-6">
          <CardContent>
            <SignUpCardContent form={form} />
          </CardContent>
          <CardFooter>
            <SignUpCardFooter
              isFormValid={isFormValid}
              isSubmitting={isSubmitting}
              onQuit={onQuit}
            />
          </CardFooter>
        </div>
      </form>
    </Form>
  );
};
