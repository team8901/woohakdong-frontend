import { ServerErrorFallback } from '@/_shared/components/ServerErrorFallback';
import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { MemberListClient } from '@/app/clubs/[clubEnglishName]/member/_clientBoundary/MemberListClient';
import { withServerCookies } from '@workspace/api';
import { getClubMembers, searchClubs } from '@workspace/api/generated';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ clubEnglishName: string }>;
};

export const MemberListSuspense = withSuspense(
  async ({ params }: Props) => {
    try {
      const { clubEnglishName } = await params;

      const { clubId, data } = await withServerCookies(cookies, async () => {
        // 동아리 영문명으로 clubId 조회
        const clubsResponse = await searchClubs({ nameEn: clubEnglishName });
        const foundClubId = clubsResponse.data?.[0]?.id ?? null;

        if (foundClubId === null) {
          return { clubId: null, data: null };
        }

        const membersData = await getClubMembers(foundClubId);

        return { clubId: foundClubId, data: membersData };
      });

      if (clubId === null) {
        notFound();
      }

      return <MemberListClient initialData={data!} clubId={clubId} />;
    } catch (error) {
      console.error('MemberListSuspense', error);

      return (
        <ServerErrorFallback message="동아리 구성원 목록을 불러오지 못했어요" />
      );
    }
  },
  // TODO: fallback 구현
  { fallback: <div>로딩중...</div> },
);
