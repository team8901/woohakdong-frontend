import { Skeleton } from '@workspace/ui/components/skeleton';

export const NoticeListSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* 필터 스켈레톤 */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 flex-1" />
      </div>

      {/* 결과 카운트 & 버튼 스켈레톤 */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* 공지사항 카드 스켈레톤 */}
      <div className="grid gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-3/4" />
                </div>
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
                <div className="mt-4 flex items-center gap-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
