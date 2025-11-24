import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { ItemHistoryListClient } from '@/app/(dashboard)/item-history/_clientBoundary/ItemHistoryListClient';
import { getClubItemHistory } from '@/data/club/getClubItemHistory/fetch';

export const ItemHistoryListSuspense = withSuspense(
  async () => {
    // TODO: clubId 동적 처리
    const data = await getClubItemHistory({ clubId: 1 });

    return <ItemHistoryListClient initialData={data} />;
  },
  // TODO: fallback 구현
  { fallback: <div>로딩중...</div> },
);
