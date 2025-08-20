import { Card } from '@workspace/ui/components/card';
import { SignUpCardHeader } from './_components/SignUpCardHeader';
import { SignUpFormClient } from './_clientBoundary/SignUpFormClient';

const SignUpPage = () => {
  return (
    <div className="bg-muted md:p-18 flex min-h-screen w-screen items-center justify-center px-5 py-12">
      <div className="mx-auto flex w-full max-w-lg flex-col">
        <Card>
          <SignUpCardHeader />
          <SignUpFormClient />
        </Card>
      </div>
    </div>
  );
};

export default SignUpPage;
