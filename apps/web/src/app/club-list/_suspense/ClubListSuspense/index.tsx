import { ServerErrorFallback } from '@/_shared/components/ServerErrorFallback';
import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { ClubListClient } from '@/app/club-list/_clientBoundary/ClubListClient';
import { getJoinedClubs } from '@workspace/api/generated';

export const ClubListSuspense = withSuspense(
  async () => {
    try {
      const data = await getJoinedClubs();

      return <ClubListClient initialData={data} />;
    } catch (error) {
      console.error('ClubListSuspense', error);

      return <ServerErrorFallback message="동아리 정보 검색에 실패했어요" />;
    }
  },
  { fallback: <span>로딩중...</span> },
);
