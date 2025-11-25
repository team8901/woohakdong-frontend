import { type ClubMemberRole } from '@/app/(dashboard)/member/_helpers/constants/clubMemberRole';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { ClubInfoFormClient } from './_clientBoundary/ClubInfoFormClient';

const ClubInfoPage = async () => {
  const cookieStore = await cookies();
  const clubMemberRole = cookieStore.get('clubMemberRole')?.value;

  if (!clubMemberRole) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <ClubInfoFormClient clubMemberRole={clubMemberRole as ClubMemberRole} />
    </div>
  );
};

export default ClubInfoPage;
