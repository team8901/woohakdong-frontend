import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { ClubInfoFormClient } from '@/app/(dashboard)/club-info/_clientBoundary/ClubInfoFormClient';
import { type ClubMemberRole } from '@/app/(dashboard)/member/_helpers/constants/clubMemberRole';
import { getJoinedClubs } from '@workspace/api/generated';
import { Spinner } from '@workspace/ui/components/spinner';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export const ClubInfoFormSuspense = withSuspense(
  async () => {
    try {
      const clubsData = await getJoinedClubs();
      const clubs = clubsData.data ?? [];
      // TODO: clubEnglishName으로 동아리 정보 조회하도록 수정
      const clubInfo = clubs[0];

      if (!clubInfo) {
        notFound();
      }

      const cookieStore = await cookies();
      const clubMemberRole = cookieStore.get('clubMemberRole')?.value;

      if (!clubMemberRole) {
        notFound();
      }

      return (
        <ClubInfoFormClient
          clubMemberRole={clubMemberRole as ClubMemberRole}
          initialData={clubInfo}
        />
      );
    } catch (error) {
      console.error('ClubInfoFormSuspense', error);

      throw new Error('동아리 정보를 불러오지 못했어요');
    }
  },
  {
    fallback: (
      <div className="flex h-96 items-center justify-center">
        <Spinner />
      </div>
    ),
  },
);
