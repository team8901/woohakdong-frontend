import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { MemberListClient } from '@/app/(dashboard)/member/_clientBoundary/MemberListClient';

export const MemberListSuspense = withSuspense(
  async () => {
    // TODO: fetch api
    const data: string[] = [];

    return <MemberListClient initialData={data} />;
  },
  // TODO: fallback 구현
  { fallback: <div>로딩중...</div> },
);
