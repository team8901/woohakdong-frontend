import { QrCardClient } from '@/app/register-club/success/_clientBoundary/QrCardClient';
import { RegisterClubSuccessCardHeader } from '@/app/register-club/success/_components/RegisterClubSuccessCardHeader';
import { Card } from '@workspace/ui/components/card';

const RegisterClubSuccessPage = () => {
  return (
    <div className="bg-muted md:p-18 flex min-h-screen w-screen items-center justify-center px-5 py-12">
      <div className="mx-auto flex w-full max-w-lg flex-col">
        <Card>
          <RegisterClubSuccessCardHeader />
          <QrCardClient />
        </Card>
      </div>
    </div>
  );
};

export default RegisterClubSuccessPage;
