import { ServerErrorFallback } from '@/_shared/components/ServerErrorFallback';
import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { getClubIdByEnglishName } from '@/_shared/helpers/utils/getClubIdByEnglishName';
import { getAllClubApplicationForms } from '@workspace/api/generated';
import { Spinner } from '@workspace/ui/components/spinner';

import { ApplicationFormListClient } from '../../_clientBoundary/ApplicationFormListClient';

type Props = {
  params: Promise<{ clubEnglishName: string }>;
};

export const ApplicationFormListSuspense = withSuspense(
  async ({ params }: Props) => {
    try {
      const { clubEnglishName } = await params;

      const clubId = await getClubIdByEnglishName(clubEnglishName);

      if (clubId === null) {
        return <ServerErrorFallback message="동아리 정보를 찾을 수 없어요." />;
      }

      const data = await getAllClubApplicationForms(clubId);

      return (
        <ApplicationFormListClient
          initialData={data}
          clubId={clubId}
          clubEnglishName={clubEnglishName}
        />
      );
    } catch (error) {
      console.error('ApplicationFormListSuspense', error);

      return <ServerErrorFallback message="신청서 목록을 불러오지 못했어요" />;
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
