import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { MemberListClient } from '@/app/(dashboard)/member/_clientBoundary/MemberListClient';
import { getClubMembers } from '@/data/club/getClubMembers/fetch';

export const MemberListSuspense = withSuspense(
  async () => {
    // TODO: clubId 동적으로 받기
    const data = await getClubMembers({ clubId: 1 });

    return <MemberListClient initialData={data} />;
  },
  // TODO: fallback 구현
  { fallback: <div>로딩중...</div> },
);
