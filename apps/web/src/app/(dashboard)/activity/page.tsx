import { ActivityCardClient } from './_clientBoundary/ActivityCardClient';
import { ActivityHeaderClient } from './_clientBoundary/ActivityHeaderClient';
import { sampleActivityData } from './_helpers/types/sampleActivityData';

const ActivityPage = () => {
  return (
    <div className="space-y-6">
      <ActivityHeaderClient />

      <div className="grid gap-6">
        {sampleActivityData.map((activity) => (
          <ActivityCardClient key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
};

export default ActivityPage;
