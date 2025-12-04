import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { getClubIdByEnglishName } from '@/_shared/helpers/utils/getClubIdByEnglishName';
import { getNotices } from '@workspace/api/generated';
import { Spinner } from '@workspace/ui/components/spinner';
import { cookies } from 'next/headers';

import { type ClubMemberRole } from '../../member/_helpers/constants/clubMemberRole';
import { NoticeListClient } from '../_clientBoundary/NoticeListClient';

type Props = {
  params: Promise<{ clubEnglishName: string }>;
};

export const NoticeListSuspense = withSuspense(
  async ({ params }: Props) => {
    try {
      const { clubEnglishName } = await params;

      // 동아리 영문명으로 clubId 조회
      const clubId = await getClubIdByEnglishName(clubEnglishName);

      if (clubId === null) {
        throw new Error('동아리 정보를 찾을 수 없어요.');
      }

      const data = await getNotices(clubId);

      const cookieStore = await cookies();
      const clubMemberRole = cookieStore.get('clubMemberRole')?.value;

      if (!clubMemberRole) {
        throw new Error('동아리 멤버 권한 정보를 찾을 수 없어요.');
      }

      return (
        <NoticeListClient
          initialData={data}
          clubId={clubId}
          clubMemberRole={clubMemberRole as ClubMemberRole}
        />
      );
    } catch (error) {
      console.error('NoticeListSuspense', error);

      throw new Error(`동아리 공지사항 목록을 불러오지 못했어요`);
    }
  },
  {
    fallback: (
      <div className="flex w-full items-center justify-center">
        <Spinner className="text-muted-foreground size-6" />
      </div>
    ),
  },
);
