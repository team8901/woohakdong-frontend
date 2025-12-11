import { ServerErrorFallback } from '@/_shared/components/ServerErrorFallback';
import { TableSkeleton } from '@/_shared/components/skeletons';
import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { getClubIdByEnglishName } from '@/_shared/helpers/utils/getClubIdByEnglishName';
import { MemberListClient } from '@/app/clubs/[clubEnglishName]/member/_clientBoundary/MemberListClient';
import { getClubMembers } from '@workspace/api/generated';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ clubEnglishName: string }>;
};

export const MemberListSuspense = withSuspense(
  async ({ params }: Props) => {
    try {
      const { clubEnglishName } = await params;
      const clubId = await getClubIdByEnglishName(clubEnglishName);

      if (clubId === null) {
        notFound();
      }

      const data = await getClubMembers(clubId);

      return <MemberListClient initialData={data} clubId={clubId} />;
    } catch (error) {
      console.error('MemberListSuspense', error);

      return (
        <ServerErrorFallback message="동아리 구성원 목록을 불러오지 못했어요" />
      );
    }
  },
  {
    fallback: <TableSkeleton columns={6} rows={5} />,
  },
);
