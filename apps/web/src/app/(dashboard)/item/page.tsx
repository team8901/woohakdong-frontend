import { ItemHeader } from '@/app/(dashboard)/item/_components/ItemHeader';
import { ItemListSuspense } from '@/app/(dashboard)/item/_suspense/ItemListSuspense';

const ItemPage = () => {
  return (
    <div className="space-y-6">
      <ItemHeader />
      <ItemListSuspense />
    </div>
  );
};

export default ItemPage;
