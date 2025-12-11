import { ServerErrorFallback } from '@/_shared/components/ServerErrorFallback';
import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { getClubIdByEnglishName } from '@/_shared/helpers/utils/getClubIdByEnglishName';
import {
  getAllClubApplicationForms,
  searchClubs,
} from '@workspace/api/generated';
import { Spinner } from '@workspace/ui/components/spinner';

import { JoinFormClient } from '../../_clientBoundary/JoinFormClient';

type Props = {
  params: Promise<{ clubEnglishName: string; formId: string }>;
};

export const JoinFormSuspense = withSuspense(
  async ({ params }: Props) => {
    try {
      const { clubEnglishName, formId } = await params;
      const applicationFormId = Number(formId);

      const clubId = await getClubIdByEnglishName(clubEnglishName);

      if (clubId === null) {
        return <ServerErrorFallback message="동아리 정보를 찾을 수 없어요." />;
      }

      const [clubResponse, formsResponse] = await Promise.all([
        searchClubs({ nameEn: clubEnglishName }),
        getAllClubApplicationForms(clubId),
      ]);

      const clubInfo = clubResponse.data?.[0];
      const applicationForm = formsResponse.data?.find(
        (form) => form.clubApplicationFormId === applicationFormId,
      );

      if (!applicationForm) {
        return <ServerErrorFallback message="신청서를 찾을 수 없습니다." />;
      }

      return (
        <JoinFormClient
          clubId={clubId}
          clubInfo={clubInfo}
          applicationForm={applicationForm}
        />
      );
    } catch (error) {
      console.error('JoinFormSuspense', error);

      const message =
        error instanceof Error ? error.message : '신청서를 불러오지 못했어요';

      return <ServerErrorFallback message={message} />;
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
