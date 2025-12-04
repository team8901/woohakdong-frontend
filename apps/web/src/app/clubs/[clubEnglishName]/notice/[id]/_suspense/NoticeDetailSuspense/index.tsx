import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { getClubIdByEnglishName } from '@/_shared/helpers/utils/getClubIdByEnglishName';
import { getNotice } from '@workspace/api/generated';
import { Spinner } from '@workspace/ui/components/spinner';

import { NoticeDetailContents } from '../../_components/NoticeDetailContents';
import { NoticeNotFound } from '../../_components/NoticeNotFound';

type Props = {
  params: Promise<{ clubEnglishName: string; id: string }>;
};

export const NoticeDetailSuspense = withSuspense(
  async ({ params }: Props) => {
    const { clubEnglishName, id } = await params;
    const noticeId = Number.parseInt(id, 10);

    const clubId = await getClubIdByEnglishName(clubEnglishName);

    if (clubId === null) {
      return <NoticeNotFound />;
    }

    try {
      const notice = await getNotice(clubId, noticeId);

      if (!notice) {
        return <NoticeNotFound />;
      }

      return <NoticeDetailContents notice={notice} />;
    } catch (error) {
      console.error('NoticeDetailPage', error);

      return <NoticeNotFound />;
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
