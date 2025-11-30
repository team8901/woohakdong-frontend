import { ToListButtonClient } from '@/_shared/clientBoundary/ToListButtonClient';
import { GroupButtonsClient } from '@/app/clubs/[clubEnglishName]/activity/[id]/_clientBoundary/GroupButtonsClient';

export const ToolbarHeader = () => {
  return (
    <div className="flex flex-row items-center justify-between">
      <ToListButtonClient />
      <GroupButtonsClient />
    </div>
  );
};
