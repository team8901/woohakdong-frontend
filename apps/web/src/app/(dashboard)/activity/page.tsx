import { ActivityCardClient } from './_clientBoundary/ActivityCardClient';
import { ActivityFilterClient } from './_clientBoundary/ActivityFilterClient';
import { ActivityHeader } from './_components/ActivityHeader';
import { sampleActivityData } from './_helpers/types/sampleActivityData';

const ActivityPage = () => {
  return (
    <div className="space-y-6">
      <ActivityHeader />
      <ActivityFilterClient />
      <div className="grid gap-6">
        {sampleActivityData.map((activity) => (
          <ActivityCardClient key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
};

export default ActivityPage;
