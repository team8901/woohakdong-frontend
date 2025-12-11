import { ServerErrorFallback } from '@/_shared/components/ServerErrorFallback';
import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { getClubIdByEnglishName } from '@/_shared/helpers/utils/getClubIdByEnglishName';
import { getClubApplicationSubmissions } from '@workspace/api/generated';
import { Spinner } from '@workspace/ui/components/spinner';

import { SubmissionListClient } from '../../_clientBoundary/SubmissionListClient';

type Props = {
  params: Promise<{ clubEnglishName: string; formId: string }>;
};

export const SubmissionListSuspense = withSuspense(
  async ({ params }: Props) => {
    try {
      const { clubEnglishName, formId } = await params;
      const applicationFormId = Number(formId);

      const clubId = await getClubIdByEnglishName(clubEnglishName);

      if (clubId === null) {
        return <ServerErrorFallback message="동아리 정보를 찾을 수 없어요." />;
      }

      const data = await getClubApplicationSubmissions(clubId, applicationFormId);

      return (
        <SubmissionListClient
          initialData={data}
          clubId={clubId}
          applicationFormId={applicationFormId}
          clubEnglishName={clubEnglishName}
        />
      );
    } catch (error) {
      console.error('SubmissionListSuspense', error);

      return (
        <ServerErrorFallback message="제출된 신청서 목록을 불러오지 못했어요" />
      );
    }
  },
  {
    fallback: (
      <div className="flex w-full items-center justify-center">
        <Spinner className="text-muted-foreground size-6" />
      </div>
    ),
  },
);
