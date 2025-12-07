import { ServerErrorFallback } from '@/_shared/components/ServerErrorFallback';
import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { ItemHistoryListClient } from '@/app/clubs/[clubEnglishName]/item-history/_clientBoundary/ItemHistoryListClient';
import { withServerCookies } from '@workspace/api';
import { getClubItemHistory, searchClubs } from '@workspace/api/generated';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ clubEnglishName: string }>;
};

export const ItemHistoryListSuspense = withSuspense(
  async ({ params }: Props) => {
    try {
      const { clubEnglishName } = await params;

      const { clubId, data } = await withServerCookies(cookies, async () => {
        // 동아리 영문명으로 clubId 조회
        const clubsResponse = await searchClubs({ nameEn: clubEnglishName });
        const foundClubId = clubsResponse.data?.[0]?.id ?? null;

        if (foundClubId === null) {
          return { clubId: null, data: null };
        }

        const historyData = await getClubItemHistory(foundClubId);

        return { clubId: foundClubId, data: historyData };
      });

      if (clubId === null) {
        notFound();
      }

      return <ItemHistoryListClient initialData={data!} clubId={clubId} />;
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
