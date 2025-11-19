'use client';

import { useMemo } from 'react';

import { type ApiResponse } from '@/_shared/helpers/types/apiResponse';
import { CLUB_ITEM_SORT_OPTION } from '@/app/(dashboard)/item/_helpers/constants/sortOption';
import { ExportButtonClient } from '@/app/(dashboard)/item-history/_clientBoundary/ExportButtonClient';
import { ItemHistoryFilter } from '@/app/(dashboard)/item-history/_components/ItemHistoryFilter';
import { ItemHistoryTable } from '@/app/(dashboard)/item-history/_components/ItemHistoryTable';
import { useItemHistoryFilter } from '@/app/(dashboard)/item-history/_helpers/hooks/useItemHistoryFilter';
import { DEFAULT_OPTION } from '@/app/(dashboard)/member/_helpers/constants/defaultOption';
import { useGetClubItemHistorySuspenseQuery } from '@/data/club/getClubItemHistory/query';
import { type ClubItemHistoryResponse } from '@/data/club/getClubItemHistory/type';

type Props = {
  initialData: ApiResponse<ClubItemHistoryResponse[]>;
};

export const ItemHistoryListClient = ({ initialData }: Props) => {
  const {
    data: { data: items },
  } = useGetClubItemHistorySuspenseQuery({ clubId: 1 }, { initialData });

  const { filters, handlers } = useItemHistoryFilter();

  const {
    nameQuery,
    // renterQuery,
    categoryQuery,
    rentalStatusQuery,
    sortOption,
  } = filters;

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Apply name filter
    if (nameQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(nameQuery.toLowerCase()),
      );
    }

    // Apply renter filter
    // TODO: 대여자 필드 추가되면 활성화
    // if (renterQuery) {
    //   filtered = filtered.filter((item) =>
    //     item.renter.toLowerCase().includes(renterQuery.toLowerCase()),
    //   );
    // }

    // Apply category filter
    if (categoryQuery !== DEFAULT_OPTION) {
      filtered = filtered.filter((item) => item.category === categoryQuery);
    }

    // Apply rental status filter
    if (rentalStatusQuery !== DEFAULT_OPTION) {
      filtered = filtered.filter((item) => {
        if (rentalStatusQuery === 'OVERDUE') {
          return item.overdue;
        }

        if (rentalStatusQuery === 'RETURNED') {
          return item.returnDate;
        }

        if (rentalStatusQuery === 'RENTED') {
          return item.rentalDate && !item.returnDate && !item.overdue;
        }

        return true;
      });
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortOption === CLUB_ITEM_SORT_OPTION.최신순) {
        if (a.rentalDate === null) return 1;

        if (b.rentalDate === null) return -1;

        return (
          new Date(b.rentalDate).getTime() - new Date(a.rentalDate).getTime()
        );
      }

      if (sortOption === CLUB_ITEM_SORT_OPTION.이름) {
        return a.name.localeCompare(b.name);
      }

      if (sortOption === CLUB_ITEM_SORT_OPTION.카테고리) {
        return a.category.localeCompare(b.category);
      }

      return 0;
    });

    return filtered;
  }, [
    items,
    nameQuery,
    // renterQuery,
    categoryQuery,
    rentalStatusQuery,
    sortOption,
  ]);

  return (
    <div className="space-y-6">
      <ItemHistoryFilter filters={filters} handlers={handlers} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            <span className="text-foreground font-semibold">
              {filteredItems.length}
            </span>{' '}
            개 물품 조회됨
          </p>
          <ExportButtonClient items={filteredItems} />
        </div>
        <ItemHistoryTable items={filteredItems} />
      </div>
    </div>
  );
};
