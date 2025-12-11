import { JoinFormSuspense } from './_suspense/JoinFormSuspense';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ clubEnglishName: string; formId: string }>;
};

const JoinPage = ({ params }: Props) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <JoinFormSuspense params={params} />
    </div>
  );
};

export default JoinPage;
