import { use } from 'react';

import { sampleActivityData } from '../_helpers/types/sampleActivityData';
import { ActivityDetailContents } from './_components/ActivityDetailContents';
import { ActivityNotFound } from './_components/ActivityNotFound';
import { ToolbarHeader } from './_components/ToolbarHeader';

type props = {
  params: Promise<{
    id: string;
  }>;
};

const ActivityDetailPage = ({ params }: props) => {
  const { id } = use(params);
  const activityId = Number(id);

  // 실제로는 API에서 데이터를 가져와야 함
  const activity = sampleActivityData.find((n) => n.id === activityId);

  if (!activity) {
    return <ActivityNotFound />;
  }

  return (
    <div className="space-y-6 md:space-y-10">
      <ToolbarHeader />
      <ActivityDetailContents activity={activity} />
    </div>
  );
};

export default ActivityDetailPage;
