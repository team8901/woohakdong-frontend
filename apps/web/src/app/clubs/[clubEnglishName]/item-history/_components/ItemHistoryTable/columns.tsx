'use client';

import { getKeyByValue } from '@/_shared/helpers/utils/getKeyByValue';
import {
  CLUB_ITEM_CATEGORY,
  type ClubItemCategory,
} from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/clubItemCategory';
import { CLUB_ITEM_HISTORY_RENTAL_STATUS } from '@/app/clubs/[clubEnglishName]/item-history/_helpers/constants/clubItemHistoryRentalStatus';
import { getHistoryRentalStatusLabel } from '@/app/clubs/[clubEnglishName]/item-history/_helpers/utils/getHistoryRentalStatusLabel';
import { type ColumnDef } from '@tanstack/react-table';
import { type ClubItemHistoryResponse } from '@workspace/api/generated';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
  Book,
  Dumbbell,
  Laptop,
  type LucideIcon,
  Package,
  Pencil,
  Shirt,
} from 'lucide-react';

const CATEGORY_ICONS: Record<ClubItemCategory, LucideIcon> = {
  DIGITAL: Laptop,
  SPORT: Dumbbell,
  BOOK: Book,
  CLOTHES: Shirt,
  STATIONERY: Pencil,
  ETC: Package,
};

const getHistoryStatusVariant = (
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (status === CLUB_ITEM_HISTORY_RENTAL_STATUS['반납 완료'])
    return 'secondary';

  if (status === CLUB_ITEM_HISTORY_RENTAL_STATUS['대여 중']) return 'default';

  if (status === CLUB_ITEM_HISTORY_RENTAL_STATUS['연체']) return 'destructive';

  return 'outline';
};

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
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 48,
  },
  {
    id: 'item',
    header: '물품',
    cell: ({ row }) => {
      const name = row.original.name ?? '';
      const category = row.original.category;
      const Icon = category ? CATEGORY_ICONS[category] : Package;

      return (
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex size-9 items-center justify-center rounded-lg">
            <Icon className="text-primary size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-foreground font-medium">{name}</span>
            <span className="text-muted-foreground text-xs">
              {category ? getKeyByValue(CLUB_ITEM_CATEGORY, category) : '-'}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: 'renter',
    header: '대여자',
    cell: ({ row }) => {
      const memberName = row.original.memberName ?? '';

      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-7">
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
              {memberName.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <span className="text-foreground text-sm">{memberName}</span>
        </div>
      );
    },
  },
  {
    id: 'rentalStatus',
    header: '상태',
    cell: ({ row }) => {
      const statusLabel = getHistoryRentalStatusLabel(row.original);
      const statusValue = CLUB_ITEM_HISTORY_RENTAL_STATUS[statusLabel];

      return (
        <Badge
          variant={getHistoryStatusVariant(statusValue)}
          className="text-xs">
          {statusLabel}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'rentalDate',
    header: '대여일',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.getValue('rentalDate') ?? '-'}
      </span>
    ),
  },
  {
    id: 'returnDate',
    header: '반납일',
    cell: ({ row }) => {
      const returnDate = row.original.returnDate;

      if (!returnDate) {
        return (
          <Badge variant="secondary" className="text-xs">
            대여 중
          </Badge>
        );
      }

      return (
        <span className="text-muted-foreground text-sm">{returnDate}</span>
      );
    },
  },
];
