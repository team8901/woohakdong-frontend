'use client';

import { CardContent, CardFooter } from '@workspace/ui/components/card';
import { Form } from '@workspace/ui/components/form';

import { SignUpCardContent } from '../../_components/SignUpCardContent';
import { SignUpCardFooter } from '../../_components/SignUpCardFooter';
import { useSignUpFlow } from '../../_helpers/hooks/useSignUpFlow';

export const SignUpFormClient = () => {
  const { form, onSubmit, onQuit, isFormValid, isSubmitting } = useSignUpFlow();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <CardContent>
            <SignUpCardContent form={form} />
          </CardContent>

          <CardFooter>
            <SignUpCardFooter
              onQuit={onQuit}
              isFormValid={isFormValid}
              isSubmitting={isSubmitting}
            />
          </CardFooter>
        </div>
      </form>
    </Form>
  );
};
