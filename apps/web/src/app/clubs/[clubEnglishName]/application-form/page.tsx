import { ApplicationFormHeader } from './_components/ApplicationFormHeader';
import { ApplicationFormListSuspense } from './_suspense/ApplicationFormListSuspense';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ clubEnglishName: string }>;
};

const ApplicationFormPage = ({ params }: Props) => {
  return (
    <div className="space-y-6">
      <ApplicationFormHeader />
      <ApplicationFormListSuspense params={params} />
    </div>
  );
};

export default ApplicationFormPage;
