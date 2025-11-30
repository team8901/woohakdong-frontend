import { PulseIcon } from '@/app/clubs/[clubEnglishName]/item-history/_components/PulseIcon';
import { StatsCard } from '@/app/clubs/[clubEnglishName]/item-history/_components/StatusCard';
import { History } from 'lucide-react';

type Props = {
  totalCount: number;
  returnedCount: number;
  rentedCount: number;
  overdueCount: number;
};

export const ItemHistoryStats = ({
  totalCount,
  returnedCount,
  rentedCount,
  overdueCount,
}: Props) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        label="전체 대여 횟수"
        value={totalCount}
        icon={<History className="h-8 w-8 text-gray-400" />}
      />
      <StatsCard
        label="반납 완료"
        value={returnedCount}
        icon={<PulseIcon color="green" />}
      />
      <StatsCard
        label="대여 중"
        value={rentedCount}
        icon={<PulseIcon color="blue" />}
      />
      <StatsCard
        label="연체"
        value={overdueCount}
        icon={<PulseIcon color="red" />}
      />
    </div>
  );
};
