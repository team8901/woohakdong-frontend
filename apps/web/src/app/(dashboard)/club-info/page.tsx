import {
  CLUB_MEMBER_ROLE,
  type ClubMemberRole,
} from '@/app/(dashboard)/member/_helpers/constants/clubMemberRole';
import { Card } from '@workspace/ui/components/card';
import { cookies } from 'next/headers';

import { ClubInfoFormClient } from './_clientBoundary/ClubInfoFormClient';
import { ClubInfoHeader } from './_components/ClubInfoHeader';

const ClubInfoPage = async () => {
  const cookieStore = await cookies();
  const clubMemberRole = cookieStore.get('clubMemberRole')
    ?.value as ClubMemberRole;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <ClubInfoHeader />
        <ClubInfoFormClient
          clubMemberRole={clubMemberRole ?? CLUB_MEMBER_ROLE.멤버}
        />
      </Card>
    </div>
  );
};

export default ClubInfoPage;
