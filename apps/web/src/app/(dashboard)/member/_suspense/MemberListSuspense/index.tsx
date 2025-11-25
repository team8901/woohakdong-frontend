import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { getClubIdByEnglishName } from '@/_shared/helpers/utils/getClubIdByEnglishName';
import { MemberListClient } from '@/app/(dashboard)/member/_clientBoundary/MemberListClient';
import { getClubMembers } from '@/data/club/getClubMembers/fetch';
import { notFound } from 'next/navigation';

export const MemberListSuspense = withSuspense(
  async () => {
    try {
      // TODO: URL 동아리 영문명 가져오기
      const clubEnglishName = 'doit';

      // 동아리 영문명으로 clubId 조회
      const clubId = await getClubIdByEnglishName(clubEnglishName);

      if (!clubId) {
        notFound();
      }

      const data = await getClubMembers({ clubId });

      return <MemberListClient initialData={data} />;
    } catch (error) {
      console.error('MemberListSuspense', error);

      throw new Error(`동아리 구성원 목록을 불러오지 못했어요`);
    }
  },
  // TODO: fallback 구현
  { fallback: <div>로딩중...</div> },
);
