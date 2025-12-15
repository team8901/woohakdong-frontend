import { SubmissionListSuspense } from './_suspense/SubmissionListSuspense';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ clubEnglishName: string; formId: string }>;
};

const SubmissionsPage = ({ params }: Props) => {
  return (
    <div className="space-y-6">
      <SubmissionListSuspense params={params} />
    </div>
  );
};

export default SubmissionsPage;
