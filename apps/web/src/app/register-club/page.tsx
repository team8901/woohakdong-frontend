import { RegisterClubFormClient } from '@/app/register-club/_clientBoundary/RegisterClubFormClient';
import { RegisterClubCardHeader } from '@/app/register-club/_components/RegisterClubCardHeader';
import { Card } from '@workspace/ui/components/card';

const RegisterClubPage = () => {
  return (
    <div className="bg-muted md:p-18 flex min-h-screen w-screen items-center justify-center px-5 py-12">
      <div className="mx-auto flex w-full max-w-lg flex-col">
        <Card>
          <RegisterClubCardHeader />
          <RegisterClubFormClient />
        </Card>
      </div>
    </div>
  );
};

export default RegisterClubPage;
