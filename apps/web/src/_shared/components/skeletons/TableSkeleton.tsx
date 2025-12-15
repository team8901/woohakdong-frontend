import { Skeleton } from '@workspace/ui/components/skeleton';

type Props = {
  columns?: number;
  rows?: number;
};

export const TableSkeleton = ({ columns = 5, rows = 5 }: Props) => {
  return (
    <div className="space-y-6">
      {/* 필터 스켈레톤 */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-12" />
        <div className="flex flex-col gap-2 md:flex-row">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>

      {/* 결과 카운트 & 버튼 스켈레톤 */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* 테이블 스켈레톤 */}
      <div className="overflow-hidden rounded-lg border bg-white">
        {/* 헤더 */}
        <div className="flex gap-4 border-b bg-gray-50 px-6 py-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {/* 행 */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-4 border-b px-6 py-4 last:border-b-0">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
