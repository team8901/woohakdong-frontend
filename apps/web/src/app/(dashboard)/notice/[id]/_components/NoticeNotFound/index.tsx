import { ToListButtonClient } from '../../_clientBoundary/ToListButtonClient';

export const NoticeNotFound = () => {
  return (
    <div className="h-full space-y-6">
      <ToListButtonClient />

      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">공지사항을 찾을 수 없습니다.</p>
      </div>
    </div>
  );
};
