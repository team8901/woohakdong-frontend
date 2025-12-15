import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { getClubIdByEnglishName } from '@/_shared/helpers/utils/getClubIdByEnglishName';
import { QrCardClient } from '@/app/clubs/[clubEnglishName]/club-info/_clientBoundary/QrCardClient';
import { getAllClubApplicationForms } from '@workspace/api/generated';
import { Spinner } from '@workspace/ui/components/spinner';

type Props = {
  params: Promise<{ clubEnglishName: string }>;
};

export const QrCardSuspense = withSuspense(
  async ({ params }: Props) => {
    const { clubEnglishName } = await params;
    const clubId = await getClubIdByEnglishName(clubEnglishName);

    if (clubId === null) {
      return null;
    }

    try {
      const { data } = await getAllClubApplicationForms(clubId);
      const forms = data ?? [];

      const latestForm = [...forms].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

        return dateB - dateA;
      })[0];

      return (
        <QrCardClient
          clubEnglishName={clubEnglishName}
          formId={latestForm?.clubApplicationFormId ?? null}
        />
      );
    } catch {
      return <QrCardClient clubEnglishName={clubEnglishName} formId={null} />;
    }
  },
  {
    fallback: (
      <div className="flex h-48 items-center justify-center">
        <Spinner />
      </div>
    ),
  },
);
