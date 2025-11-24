'use client';

import { getKeyByValue } from '@/_shared/helpers/utils/getKeyByValue';
import { CLUB_ITEM_CATEGORY } from '@/app/(dashboard)/item/_helpers/constants/clubItemCategory';
import { getRentalStatusText } from '@/app/(dashboard)/item/_helpers/utils/getRentalStatusText';
import { type ClubItemResponse } from '@/data/club/getClubItems/type';
import { type ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@workspace/ui/components/checkbox';

export const columns: ColumnDef<ClubItemResponse>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 48,
  },
  {
    accessorKey: 'name',
    header: '물품명',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('name')}</span>
    ),
  },
  {
    accessorKey: 'category',
    header: '카테고리',
    cell: ({ row }) => (
      <span>{getKeyByValue(CLUB_ITEM_CATEGORY, row.getValue('category'))}</span>
    ),
  },
  {
    accessorKey: 'location',
    header: '위치',
    cell: ({ row }) => <span>{row.getValue('location')}</span>,
  },
  {
    id: 'rentalStatus',
    header: '대여 상태',
    cell: ({ row }) => <span>{getRentalStatusText(row.original)}</span>,
  },
  {
    accessorKey: 'rentalDate',
    header: '반납 예정 날짜',
    cell: ({ row }) => (
      <span className="text-gray-600">{row.getValue('rentalDate') ?? '-'}</span>
    ),
  },
];
