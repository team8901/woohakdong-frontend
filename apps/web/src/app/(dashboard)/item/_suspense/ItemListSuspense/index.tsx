import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { ItemListClient } from '@/app/(dashboard)/item/_clientBoundary/ItemListClient';
import { getClubItems } from '@/data/club/getClubItems/fetch';

export const ItemListSuspense = withSuspense(
  async () => {
    // TODO: clubId 동적 처리
    const data = await getClubItems({ clubId: 1 });

    return <ItemListClient initialData={data} />;
  },
  // TODO: fallback 구현
  { fallback: <div>로딩중...</div> },
);
