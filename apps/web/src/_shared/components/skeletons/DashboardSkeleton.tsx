import { Skeleton } from '@workspace/ui/components/skeleton';

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* 통계 카드 스켈레톤 */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-6">
            <div className="flex items-center justify-between pb-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="size-4" />
            </div>
            <Skeleton className="mt-2 h-8 w-20" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </div>

      {/* 공지사항 & 일정 스켈레톤 */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <Skeleton className="h-5 w-28" />
                <Skeleton className="mt-2 h-3 w-40" />
              </div>
              <Skeleton className="size-4" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-start gap-3 p-2">
                  <Skeleton className="mt-0.5 size-4 shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="mt-2 h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 활동기록 스켈레톤 */}
      <div className="rounded-xl border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-28" />
            <Skeleton className="mt-2 h-3 w-40" />
          </div>
          <Skeleton className="size-4" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="size-4 shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 대여 현황 스켈레톤 */}
      <div className="rounded-xl border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-2 h-3 w-36" />
          </div>
          <Skeleton className="size-4" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <Skeleton className="size-4" />
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-2 h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
