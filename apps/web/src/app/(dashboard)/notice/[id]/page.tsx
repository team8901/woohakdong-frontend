import { use } from 'react';

import { sampleNoticeData } from '../_helpers/types/sampleNoticeData';
import { NoticeDetailContents } from './_components/NoticeDetailContents';
import { NoticeNotFound } from './_components/NoticeNotFound';
import { ToolbarHeader } from './_components/ToolbarHeader';

type props = {
  params: Promise<{
    id: string;
  }>;
};

const NoticeDetailPage = ({ params }: props) => {
  const { id } = use(params);
  const noticeId = parseInt(id, 10);

  // 유효성 검사
  if (isNaN(noticeId) || noticeId <= 0) {
    return <NoticeNotFound />;
  }

  // 실제로는 API에서 데이터를 가져와야 함
  const notice = sampleNoticeData.find((n) => n.id === noticeId);

  if (!notice) {
    return <NoticeNotFound />;
  }

  return (
    <div className="space-y-6 md:space-y-10">
      <ToolbarHeader />
      <NoticeDetailContents notice={notice} />
    </div>
  );
};

export default NoticeDetailPage;
