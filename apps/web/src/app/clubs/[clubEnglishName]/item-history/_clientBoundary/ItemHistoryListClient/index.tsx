'use client';

import { useMemo, useState } from 'react';

import { CLUB_ITEM_SORT_OPTION } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/sortOption';
import { ExportButtonClient } from '@/app/clubs/[clubEnglishName]/item-history/_clientBoundary/ExportButtonClient';
import { ItemHistoryFilter } from '@/app/clubs/[clubEnglishName]/item-history/_components/ItemHistoryFilter';
import { ItemHistoryStats } from '@/app/clubs/[clubEnglishName]/item-history/_components/ItemHistoryStats';
import { ItemHistoryTable } from '@/app/clubs/[clubEnglishName]/item-history/_components/ItemHistoryTable';
import { CLUB_ITEM_HISTORY_RENTAL_STATUS } from '@/app/clubs/[clubEnglishName]/item-history/_helpers/constants/clubItemHistoryRentalStatus';
import { useItemHistoryFilter } from '@/app/clubs/[clubEnglishName]/item-history/_helpers/hooks/useItemHistoryFilter';
import { DEFAULT_OPTION } from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/defaultOption';
import {
  type ClubItemHistoryResponse,
  getGetClubItemHistoryQueryKey,
  type ListWrapperClubItemHistoryResponse,
  useGetClubItemHistory,
} from '@workspace/api/generated';

type Props = {
  initialData: ListWrapperClubItemHistoryResponse;
  clubId: number;
};

export const ItemHistoryListClient = ({ initialData, clubId }: Props) => {
  const { data } = useGetClubItemHistory(clubId, {
    query: {
      queryKey: getGetClubItemHistoryQueryKey(clubId),
      initialData,
    },
  });

  const items = useMemo(() => data?.data ?? [], [data]);

  const [selectedItems, setSelectedItems] = useState<ClubItemHistoryResponse[]>(
    [],
  );
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
        item.name?.toLowerCase().includes(nameQuery.toLowerCase()),
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
        if (rentalStatusQuery === CLUB_ITEM_HISTORY_RENTAL_STATUS['연체']) {
          return item.overdue;
        }

        if (
          rentalStatusQuery === CLUB_ITEM_HISTORY_RENTAL_STATUS['반납 완료']
        ) {
          return item.returnDate;
        }

        if (rentalStatusQuery === CLUB_ITEM_HISTORY_RENTAL_STATUS['대여 중']) {
          return item.rentalDate && !item.returnDate && !item.overdue;
        }

        return true;
      });
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortOption === CLUB_ITEM_SORT_OPTION.최신순) {
        if (!a.rentalDate) return 1;

        if (!b.rentalDate) return -1;

        return (
          new Date(b.rentalDate).getTime() - new Date(a.rentalDate).getTime()
        );
      }

      if (sortOption === CLUB_ITEM_SORT_OPTION.이름) {
        if (!a.name || !b.name) return 0;

        return a.name.localeCompare(b.name);
      }

      if (sortOption === CLUB_ITEM_SORT_OPTION.카테고리) {
        if (!a.category || !b.category) return 0;

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

  const stats = useMemo(() => {
    const totalCount = items.length;
    const returnedCount = items.filter((item) => item.returnDate).length;
    const rentedCount = items.filter(
      (item) => item.rentalDate && !item.returnDate && !item.overdue,
    ).length;
    const overdueCount = items.filter((item) => item.overdue).length;

    return { totalCount, returnedCount, rentedCount, overdueCount };
  }, [items]);

  return (
    <div className="space-y-6">
      <ItemHistoryStats
        totalCount={stats.totalCount}
        returnedCount={stats.returnedCount}
        rentedCount={stats.rentedCount}
        overdueCount={stats.overdueCount}
      />
      <ItemHistoryFilter filters={filters} handlers={handlers} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            <span className="text-foreground font-semibold">
              {filteredItems.length}
            </span>{' '}
            개 물품 조회됨
          </p>
          <ExportButtonClient
            items={filteredItems}
            selectedItems={selectedItems}
          />
        </div>
        <ItemHistoryTable
          items={filteredItems}
          onSelectionChange={setSelectedItems}
        />
      </div>
    </div>
  );
};
