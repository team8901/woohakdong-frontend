'use client';

import { useMemo, useState } from 'react';

import { ExportButtonClient } from '@/app/clubs/[clubEnglishName]/item/_clientBoundary/ExportButtonClient';
import { ItemFilter } from '@/app/clubs/[clubEnglishName]/item/_components/ItemFilter';
import { ItemTable } from '@/app/clubs/[clubEnglishName]/item/_components/ItemTable';
import { CLUB_ITEM_RENTAL_STATUS } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/clubItemRentalStatus';
import { CLUB_ITEM_SORT_OPTION } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/sortOption';
import { useItemFilter } from '@/app/clubs/[clubEnglishName]/item/_helpers/hooks/useItemFilter';
import { DEFAULT_OPTION } from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/defaultOption';
import {
  type ClubItemResponse,
  getGetClubItemsQueryKey,
  type ListWrapperClubItemResponse,
  useGetClubItems,
} from '@workspace/api/generated';

type Props = {
  initialData: ListWrapperClubItemResponse;
  clubId: number;
};

export const ItemListClient = ({ initialData, clubId }: Props) => {
  const { data } = useGetClubItems(clubId, undefined, {
    query: {
      queryKey: getGetClubItemsQueryKey(clubId),
      initialData,
    },
  });

  const items = useMemo(() => data?.data ?? [], [data]);

  const [selectedItems, setSelectedItems] = useState<ClubItemResponse[]>([]);
  const { filters, handlers } = useItemFilter();

  const { nameQuery, categoryQuery, rentalStatusQuery, sortOption } = filters;

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Apply name filter
    if (nameQuery) {
      filtered = filtered.filter((item) =>
        item.name?.toLowerCase().includes(nameQuery.toLowerCase()),
      );
    }

    // Apply category filter
    if (categoryQuery !== DEFAULT_OPTION) {
      filtered = filtered.filter((item) => item.category === categoryQuery);
    }

    // Apply rental status filter
    if (rentalStatusQuery !== DEFAULT_OPTION) {
      filtered = filtered.filter((item) => {
        if (rentalStatusQuery === CLUB_ITEM_RENTAL_STATUS['대여 가능']) {
          return item.available;
        }

        if (rentalStatusQuery === CLUB_ITEM_RENTAL_STATUS['대여 중']) {
          return item.using;
        }

        if (rentalStatusQuery === CLUB_ITEM_RENTAL_STATUS['대여 불가']) {
          return !item.available && !item.using;
        }

        return true;
      });
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortOption === CLUB_ITEM_SORT_OPTION.최신순) {
        if (a.rentalDate === null || a.rentalDate === undefined) {
          return 1;
        }

        if (b.rentalDate === null || b.rentalDate === undefined) {
          return -1;
        }

        return (
          new Date(b.rentalDate).getTime() - new Date(a.rentalDate).getTime()
        );
      }

      if (a.name === undefined || b.name === undefined) {
        return 0;
      }

      if (sortOption === CLUB_ITEM_SORT_OPTION.이름) {
        return a.name.localeCompare(b.name);
      }

      if (a.category === undefined || b.category === undefined) {
        return 0;
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
      <ItemFilter filters={filters} handlers={handlers} />
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
      </div>
      <ItemTable
        items={filteredItems}
        clubId={clubId}
        onSelectionChange={setSelectedItems}
      />
    </div>
  );
};
