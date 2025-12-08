import { ServerErrorFallback } from '@/_shared/components/ServerErrorFallback';
import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { getClubIdByEnglishName } from '@/_shared/helpers/utils/getClubIdByEnglishName';
import { ClubInfoFormClient } from '@/app/clubs/[clubEnglishName]/club-info/_clientBoundary/ClubInfoFormClient';
import { type ClubMemberRole } from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/clubMemberRole';
import { getJoinedClubs } from '@workspace/api/generated';
import { Spinner } from '@workspace/ui/components/spinner';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ clubEnglishName: string }>;
};

export const ClubInfoFormSuspense = withSuspense(
  async ({ params }: Props) => {
    try {
      const { clubEnglishName } = await params;
      const clubId = await getClubIdByEnglishName(clubEnglishName);

      const { data } = await getJoinedClubs();
      const clubs = data ?? [];
      const clubInfo = clubs.find((club) => club.id === clubId);

      if (!clubInfo) {
        notFound();
      }

      const cookieStore = await cookies();
      const clubMemberRole = cookieStore.get('clubMemberRole')?.value;

      if (!clubMemberRole) {
        return (
          <ServerErrorFallback message="동아리 멤버 권한 정보를 찾을 수 없어요" />
        );
      }

      return (
        <ClubInfoFormClient
          clubMemberRole={clubMemberRole as ClubMemberRole}
          initialData={clubInfo}
        />
      );
    } catch (error) {
      console.error('ClubInfoFormSuspense', error);

      return <ServerErrorFallback message="동아리 정보를 불러오지 못했어요" />;
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
