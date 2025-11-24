import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { MemberListClient } from '@/app/(dashboard)/member/_clientBoundary/MemberListClient';
import { type ClubMembersResponse } from '@/data/club/getClubMembers/type';
import { 동아리_회원_목록 } from '@/mock/handlers/club/getClubMembers/mockData';

export const MemberListSuspense = withSuspense(
  async () => {
    // TODO: fetch api 연결 & 목데이터 교체
    const data: ClubMembersResponse[] = 동아리_회원_목록.data;

    return <MemberListClient initialData={data} />;
  },
  // TODO: fallback 구현
  { fallback: <div>로딩중...</div> },
);
