import { ToListButtonClient } from '@/_shared/clientBoundary/ToListButtonClient';

export const ActivityNotFound = () => {
  return (
    <div className="h-full space-y-6">
      <ToListButtonClient />

      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">활동 기록을 찾을 수 없습니다.</p>
      </div>
    </div>
  );
};
