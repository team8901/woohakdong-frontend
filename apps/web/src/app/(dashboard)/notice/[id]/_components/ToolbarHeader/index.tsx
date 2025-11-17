import { GroupButtonsClient } from '../../_clientBoundary/GroupButtonsClient';
import { ToListButtonClient } from '../../_clientBoundary/ToListButtonClient';

export const ToolbarHeader = () => {
  return (
    <div className="flex flex-row items-center justify-between">
      <ToListButtonClient />
      <GroupButtonsClient />
    </div>
  );
};
