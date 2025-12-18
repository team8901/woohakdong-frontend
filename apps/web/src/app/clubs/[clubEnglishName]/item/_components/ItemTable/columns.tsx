'use client';

import { getKeyByValue } from '@/_shared/helpers/utils/getKeyByValue';
import {
  CLUB_ITEM_CATEGORY,
  type ClubItemCategory,
} from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/clubItemCategory';
import { CLUB_ITEM_RENTAL_STATUS } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/clubItemRentalStatus';
import { getRentalStatusLabel } from '@/app/clubs/[clubEnglishName]/item/_helpers/utils/getRentalStatusLabel';
import { type ColumnDef } from '@tanstack/react-table';
import { type ClubItemResponse } from '@workspace/api/generated';
import { Badge } from '@workspace/ui/components/badge';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
  Book,
  Dumbbell,
  Laptop,
  type LucideIcon,
  MapPin,
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

const getRentalStatusVariant = (
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (status === CLUB_ITEM_RENTAL_STATUS['대여 가능']) return 'default';

  if (status === CLUB_ITEM_RENTAL_STATUS['대여 중']) return 'secondary';

  return 'outline';
};

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
    accessorKey: 'location',
    header: '위치',
    cell: ({ row }) => {
      const location = row.getValue('location') as string;

      return (
        <div className="text-muted-foreground flex items-center gap-1 text-sm">
          <MapPin className="size-3" />
          <span>{location || '위치 미지정'}</span>
        </div>
      );
    },
  },
  {
    id: 'rentalStatus',
    header: '대여 상태',
    cell: ({ row }) => {
      const statusLabel = getRentalStatusLabel(row.original);
      const statusValue = CLUB_ITEM_RENTAL_STATUS[statusLabel];

      return (
        <Badge
          variant={getRentalStatusVariant(statusValue)}
          className="text-xs">
          {statusLabel}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'rentalDate',
    header: '반납 예정일',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.getValue('rentalDate') ?? '-'}
      </span>
    ),
  },
  {
    accessorKey: 'rentalMaxDay',
    header: '최대 대여일',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.getValue('rentalMaxDay')}일
      </span>
    ),
  },
];
