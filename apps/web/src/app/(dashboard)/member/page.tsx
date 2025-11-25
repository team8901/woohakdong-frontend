import { MemberHeader } from '@/app/(dashboard)/member/_components/MemberHeader';
import { MemberListSuspense } from '@/app/(dashboard)/member/_suspense/MemberListSuspense';

/**
 * 동적 렌더링 강제 설정
 * - 서버에서 인증 필요한 API(getClubMembers)를 호출하므로 빌드 타임 정적 생성 방지
 * - 런타임에만 렌더링하여 실제 유저의 인증 정보로 데이터 fetch
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
 */
export const dynamic = 'force-dynamic';

const MemberPage = () => {
  return (
    <div className="space-y-6">
      <MemberHeader />
      <MemberListSuspense />
    </div>
  );
};

export default MemberPage;
