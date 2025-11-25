'use client';

import { getKeyByValue } from '@/_shared/helpers/utils/getKeyByValue';
import { CLUB_MEMBER_GENDER } from '@/app/(dashboard)/member/_helpers/constants/clubMemberGender';
import { CLUB_MEMBER_ROLE } from '@/app/(dashboard)/member/_helpers/constants/clubMemberRole';
import { type ColumnDef } from '@tanstack/react-table';
import { type ClubMembershipResponse } from '@workspace/api/generated';
import { Checkbox } from '@workspace/ui/components/checkbox';

export const columns: ColumnDef<ClubMembershipResponse>[] = [
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
    header: '이름',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('name')}</span>
    ),
  },
  {
    accessorKey: 'clubMemberRole',
    header: '역할',
    cell: ({ row }) => (
      <span>
        {getKeyByValue(CLUB_MEMBER_ROLE, row.getValue('clubMemberRole'))}
      </span>
    ),
  },
  {
    accessorKey: 'gender',
    header: '성별',
    cell: ({ row }) => (
      <span>{getKeyByValue(CLUB_MEMBER_GENDER, row.getValue('gender'))}</span>
    ),
  },
  {
    accessorKey: 'phoneNumber',
    header: '전화번호',
    cell: ({ row }) => <span>{row.getValue('phoneNumber')}</span>,
  },
  {
    accessorKey: 'email',
    header: '이메일',
    cell: ({ row }) => (
      <span className="text-gray-600">{row.getValue('email')}</span>
    ),
  },
  {
    accessorKey: 'major',
    header: '학과',
    cell: ({ row }) => <span>{row.getValue('major')}</span>,
  },
  {
    accessorKey: 'studentId',
    header: '학번',
    cell: ({ row }) => <span>{row.getValue('studentId')}</span>,
  },
  {
    accessorKey: 'clubJoinDate',
    header: '가입일',
    cell: ({ row }) => (
      <span className="text-gray-600">{row.getValue('clubJoinDate')}</span>
    ),
  },
];
