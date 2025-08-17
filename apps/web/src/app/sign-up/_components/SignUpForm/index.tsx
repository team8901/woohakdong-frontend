import { UseFormReturn } from 'react-hook-form';
import { Form } from '@workspace/ui/components/form';
import { FormData } from '../../_helpers/utils/zodSchemas';
import { UserInfoForm } from '../UserInfoForm';
import { UserSchoolInfoForm } from '../UserSchoolInfoForm';

type SignUpFormProps = {
  form: UseFormReturn<FormData>;
  step: 1 | 2;
  onSubmit: (data: FormData) => Promise<void>;
};

export const SignUpForm = ({ form, step, onSubmit }: SignUpFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {step === 1 && <UserInfoForm form={form} />}
        {step === 2 && <UserSchoolInfoForm form={form} />}
      </form>
    </Form>
  );
};
