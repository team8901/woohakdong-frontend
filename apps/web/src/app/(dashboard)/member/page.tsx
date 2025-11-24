import { MemberHeader } from '@/app/(dashboard)/member/_components/MemberHeader';
import { MemberListSuspense } from '@/app/(dashboard)/member/_suspense/MemberListSuspense';

const MemberPage = () => {
  return (
    <div className="space-y-6">
      <MemberHeader />
      <MemberListSuspense />
    </div>
  );
};

export default MemberPage;
