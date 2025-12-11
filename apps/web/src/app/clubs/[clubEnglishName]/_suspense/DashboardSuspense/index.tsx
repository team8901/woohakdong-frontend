import { ServerErrorFallback } from '@/_shared/components/ServerErrorFallback';
import { DashboardSkeleton } from '@/_shared/components/skeletons';
import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { getClubIdByEnglishName } from '@/_shared/helpers/utils/getClubIdByEnglishName';
import {
  getClubItemHistory,
  getClubItems,
  getClubMembers,
  getNotices,
} from '@workspace/api/generated';
import { cookies } from 'next/headers';

import { DashboardClient } from '../../_clientBoundary/DashboardClient';
import { type ClubMemberRole } from '../../member/_helpers/constants/clubMemberRole';

type Props = {
  params: Promise<{ clubEnglishName: string }>;
};

export const DashboardSuspense = withSuspense(
  async ({ params }: Props) => {
    try {
      const { clubEnglishName } = await params;
      const clubId = await getClubIdByEnglishName(clubEnglishName);

      if (clubId === null) {
        return <ServerErrorFallback message="동아리 정보를 찾을 수 없어요." />;
      }

      const cookieStore = await cookies();
      const clubMemberRole =
        (cookieStore.get('clubMemberRole')?.value as ClubMemberRole) ??
        'MEMBER';

      const [membersRes, itemsRes, noticesRes, itemHistoryRes] =
        await Promise.all([
          getClubMembers(clubId),
          getClubItems(clubId),
          getNotices(clubId),
          getClubItemHistory(clubId),
        ]);

      return (
        <DashboardClient
          clubEnglishName={clubEnglishName}
          clubMemberRole={clubMemberRole}
          members={membersRes.data ?? []}
          items={itemsRes.data ?? []}
          notices={noticesRes.data ?? []}
          itemHistory={itemHistoryRes.data ?? []}
        />
      );
    } catch (error) {
      console.error('DashboardSuspense', error);

      return <ServerErrorFallback message="대시보드를 불러오지 못했어요" />;
    }
  },
  {
    fallback: <DashboardSkeleton />,
  },
);
