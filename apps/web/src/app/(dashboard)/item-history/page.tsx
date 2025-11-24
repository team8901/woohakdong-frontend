import { ItemHistoryHeader } from '@/app/(dashboard)/item-history/_components/ItemHistoryHeader';
import { ItemHistoryListSuspense } from '@/app/(dashboard)/item-history/_suspense/ItemHistoryListSuspense';

const ItemHistoryPage = () => {
  return (
    <div className="space-y-6">
      <ItemHistoryHeader />
      <ItemHistoryListSuspense />
    </div>
  );
};

export default ItemHistoryPage;
