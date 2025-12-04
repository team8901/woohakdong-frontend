import { ToListButtonClient } from '@/_shared/clientBoundary/ToListButtonClient';
import { GroupButtonsClient } from '@/app/clubs/[clubEnglishName]/notice/[id]/_clientBoundary/GroupButtonsClient';

type Props = {
  clubId: number;
  noticeId: number;
  title: string;
  content: string;
  isPinned: boolean;
};

export const ToolbarHeader = ({
  clubId,
  noticeId,
  title,
  content,
  isPinned,
}: Props) => {
  return (
    <div className="flex flex-row items-center justify-between">
      <ToListButtonClient />
      <GroupButtonsClient
        clubId={clubId}
        noticeId={noticeId}
        title={title}
        content={content}
        isPinned={isPinned}
      />
    </div>
  );
};
