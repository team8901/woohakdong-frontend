import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { getClubIdByEnglishName } from '@/_shared/helpers/utils/getClubIdByEnglishName';
import { ItemListClient } from '@/app/clubs/[clubEnglishName]/item/_clientBoundary/ItemListClient';
import { getClubItems } from '@/data/club/getClubItems/fetch';

type Props = {
  params: Promise<{ clubEnglishName: string }>;
};

export const ItemListSuspense = withSuspense(
  async ({ params }: Props) => {
    try {
      const { clubEnglishName } = await params;

      // 동아리 영문명으로 clubId 조회
      const clubId = await getClubIdByEnglishName(clubEnglishName);

      if (clubId === null) {
        throw new Error('동아리 정보를 찾을 수 없어요.');
      }

      const data = await getClubItems({ clubId });

      return <ItemListClient initialData={data} clubId={clubId} />;
    } catch (error) {
      console.error('ItemListSuspense', error);

      throw new Error(`동아리 물품 목록을 불러오지 못했어요`);
    }
  },
  // TODO: fallback 구현
  { fallback: <div>로딩중...</div> },
);
