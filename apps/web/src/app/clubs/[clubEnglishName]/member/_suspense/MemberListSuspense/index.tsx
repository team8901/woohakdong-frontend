import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { getClubIdByEnglishName } from '@/_shared/helpers/utils/getClubIdByEnglishName';
import { MemberListClient } from '@/app/clubs/[clubEnglishName]/member/_clientBoundary/MemberListClient';
import { getClubMembers } from '@workspace/api/generated';

type Props = {
  params: Promise<{ clubEnglishName: string }>;
};

export const MemberListSuspense = withSuspense(
  async ({ params }: Props) => {
    try {
      const { clubEnglishName } = await params;

      // 동아리 영문명으로 clubId 조회
      const clubId = await getClubIdByEnglishName(clubEnglishName);

      if (clubId === null) {
        throw new Error('동아리 정보를 찾을 수 없어요.');
      }

      const data = await getClubMembers(clubId);

      return <MemberListClient initialData={data} clubId={clubId} />;
    } catch (error) {
      console.error('MemberListSuspense', error);

      throw new Error(`동아리 구성원 목록을 불러오지 못했어요`);
    }
  },
  // TODO: fallback 구현
  { fallback: <div>로딩중...</div> },
);
