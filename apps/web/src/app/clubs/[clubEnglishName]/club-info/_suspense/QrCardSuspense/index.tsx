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

      // 가장 최근에 생성된 신청폼을 찾음
      const latestForm = forms.reduce((latest, form) => {
        if (!latest) return form;

        const latestDate = latest.createdAt
          ? new Date(latest.createdAt)
          : new Date(0);
        const formDate = form.createdAt
          ? new Date(form.createdAt)
          : new Date(0);

        return formDate > latestDate ? form : latest;
      }, forms[0] ?? null);

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
