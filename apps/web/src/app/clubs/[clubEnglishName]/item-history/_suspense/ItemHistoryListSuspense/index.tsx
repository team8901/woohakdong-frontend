import { ServerErrorFallback } from '@/_shared/components/ServerErrorFallback';
import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { getClubIdByEnglishName } from '@/_shared/helpers/utils/getClubIdByEnglishName';
import { ItemHistoryListClient } from '@/app/clubs/[clubEnglishName]/item-history/_clientBoundary/ItemHistoryListClient';
import { getClubItemHistory } from '@workspace/api/generated';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ clubEnglishName: string }>;
};

export const ItemHistoryListSuspense = withSuspense(
  async ({ params }: Props) => {
    try {
      const { clubEnglishName } = await params;

      // 동아리 영문명으로 clubId 조회
      const clubId = await getClubIdByEnglishName(clubEnglishName);

      if (clubId === null) {
        notFound();
      }

      const data = await getClubItemHistory(clubId);

      return <ItemHistoryListClient initialData={data} clubId={clubId} />;
    } catch (error) {
      console.error('ItemHistoryListSuspense', error);

      return (
        <ServerErrorFallback message="동아리 물품 대여 기록을 불러오지 못했어요" />
      );
    }
  },
  // TODO: fallback 구현
  { fallback: <div>로딩중...</div> },
);
