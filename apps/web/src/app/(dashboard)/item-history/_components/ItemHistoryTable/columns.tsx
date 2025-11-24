'use client';

import { getKeyByValue } from '@/_shared/helpers/utils/getKeyByValue';
import { CLUB_ITEM_CATEGORY } from '@/app/(dashboard)/item/_helpers/constants/clubItemCategory';
import { getHistoryRentalStatusText } from '@/app/(dashboard)/item-history/_helpers/utils/getHistoryRentalStatusText';
import { type ClubItemHistoryResponse } from '@/data/club/getClubItemHistory/type';
import { type ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@workspace/ui/components/checkbox';

export const columns: ColumnDef<ClubItemHistoryResponse>[] = [
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
  // TODO: 대여자 필드 추가되면 활성화
  // {
  //   accessorKey: 'renter',
  //   header: '대여자',
  //   cell: ({ row }) => <span>{row.getValue('renter')}</span>,
  // },
  {
    id: 'rentalStatus',
    header: '대여 상태',
    cell: ({ row }) => <span>{getHistoryRentalStatusText(row.original)}</span>,
  },
  {
    accessorKey: 'rentalDate',
    header: '대여 날짜',
    cell: ({ row }) => (
      <span className="text-gray-600">{row.getValue('rentalDate') ?? '-'}</span>
    ),
  },
  {
    accessorKey: 'returnDate',
    header: '반납 날짜',
    cell: ({ row }) => (
      <span className="text-gray-600">{row.getValue('returnDate') ?? '-'}</span>
    ),
  },
  // TODO: 대여 메모 필드 추가되면 활성화
  // {
  //   accessorKey: 'rentalMemo',
  //   header: '대여 메모',
  //   cell: ({ row }) => (
  //     <span className="text-gray-600">{row.getValue('rentalMemo')}</span>
  //   ),
  // },
];
