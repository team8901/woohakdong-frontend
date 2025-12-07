import { ServerErrorFallback } from '@/_shared/components/ServerErrorFallback';
import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { ClubInfoFormClient } from '@/app/clubs/[clubEnglishName]/club-info/_clientBoundary/ClubInfoFormClient';
import { type ClubMemberRole } from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/clubMemberRole';
import { withServerCookies } from '@workspace/api';
import { getJoinedClubs, searchClubs } from '@workspace/api/generated';
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
      const cookieStore = await cookies();

      const clubInfo = await withServerCookies(cookies, async () => {
        // 동아리 영문명으로 clubId 조회
        const clubsResponse = await searchClubs({ nameEn: clubEnglishName });
        const clubId = clubsResponse.data?.[0]?.id ?? null;

        const { data } = await getJoinedClubs();
        const clubs = data ?? [];

        return clubs.find((club) => club.id === clubId) ?? null;
      });

      if (!clubInfo) {
        notFound();
      }

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
