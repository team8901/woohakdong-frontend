import { ServerErrorFallback } from '@/_shared/components/ServerErrorFallback';
import { TableSkeleton } from '@/_shared/components/skeletons';
import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { getClubIdByEnglishName } from '@/_shared/helpers/utils/getClubIdByEnglishName';
import { ItemListClient } from '@/app/clubs/[clubEnglishName]/item/_clientBoundary/ItemListClient';
import { getClubItems } from '@workspace/api/generated';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ clubEnglishName: string }>;
};

export const ItemListSuspense = withSuspense(
  async ({ params }: Props) => {
    try {
      const { clubEnglishName } = await params;
      const clubId = await getClubIdByEnglishName(clubEnglishName);

      if (clubId === null) {
        notFound();
      }

      const data = await getClubItems(clubId);

      return <ItemListClient initialData={data} clubId={clubId} />;
    } catch (error) {
      console.error('ItemListSuspense', error);

      return (
        <ServerErrorFallback message="동아리 물품 목록을 불러오지 못했어요" />
      );
    }
  },
  {
    fallback: <TableSkeleton columns={5} rows={5} />,
  },
);
