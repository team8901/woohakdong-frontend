import { NoticeCardClient } from './_clientBoundary/NoticeCardClient';
import { NoticeHeaderClient } from './_clientBoundary/NoticeHeaderClient';
import { sampleNoticeData } from './_helpers/types/sampleNoticeData';

const NoticePage = () => {
  /** @todo 공지사항 고정하면 서버에서 정렬해주는 방식으로 변경해야할 듯 함 */
  const sortedNotices = [...sampleNoticeData].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;

    if (!a.isPinned && b.isPinned) return 1;

    return 0;
  });

  return (
    <div className="space-y-6">
      <NoticeHeaderClient />

      <div className="grid gap-6">
        {sortedNotices.map((notice) => (
          <NoticeCardClient key={notice.id} notice={notice} />
        ))}
      </div>
    </div>
  );
};

export default NoticePage;
