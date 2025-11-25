import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { getClubIdByEnglishName } from '@/_shared/helpers/utils/getClubIdByEnglishName';
import { ItemHistoryListClient } from '@/app/(dashboard)/item-history/_clientBoundary/ItemHistoryListClient';
import { getClubItemHistory } from '@/data/club/getClubItemHistory/fetch';
import { notFound } from 'next/navigation';

export const ItemHistoryListSuspense = withSuspense(
  async () => {
    try {
      // TODO: URL 동아리 영문명 가져오기
      const clubEnglishName = 'doit';

      // 동아리 영문명으로 clubId 조회
      const clubId = await getClubIdByEnglishName(clubEnglishName);

      if (!clubId) {
        notFound();
      }

      const data = await getClubItemHistory({ clubId });

      return <ItemHistoryListClient initialData={data} />;
    } catch (error) {
      console.error('ItemHistoryListSuspense', error);

      throw new Error(`동아리 물품 대여 기록을 불러오지 못했어요`);
    }
  },
  // TODO: fallback 구현
  { fallback: <div>로딩중...</div> },
);
