'use client';

import { getKeyByValue } from '@/_shared/helpers/utils/getKeyByValue';
import { CLUB_MEMBER_GENDER } from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/clubMemberGender';
import {
  CLUB_MEMBER_ROLE,
  type ClubMemberRole,
} from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/clubMemberRole';
import { type ColumnDef } from '@tanstack/react-table';
import { type ClubMembershipResponse } from '@workspace/api/generated';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
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
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 48,
  },
  {
    id: 'member',
    header: '회원',
    cell: ({ row }) => {
      const name = row.original.name ?? '';
      const role = row.original.clubMemberRole as ClubMemberRole;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <span className="text-foreground font-medium">{name}</span>
            <Badge
              variant={role === CLUB_MEMBER_ROLE.멤버 ? 'secondary' : 'default'}
              className="text-xs">
              {getKeyByValue(CLUB_MEMBER_ROLE, role)}
            </Badge>
          </div>
        </div>
      );
    },
  },
  // TODO: 회원 가입 시 학과 정보도 받게 되면 주석 해제
  // {
  //   accessorKey: 'major',
  //   header: '학과',
  //   cell: ({ row }) => (
  //     <span className="text-muted-foreground text-sm">
  //       {row.getValue('major')}
  //     </span>
  //   ),
  // },
  {
    accessorKey: 'studentId',
    header: '학번',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.getValue('studentId')}
      </span>
    ),
  },
  {
    accessorKey: 'gender',
    header: '성별',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {getKeyByValue(CLUB_MEMBER_GENDER, row.getValue('gender'))}
      </span>
    ),
  },
  {
    accessorKey: 'phoneNumber',
    header: '연락처',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.getValue('phoneNumber')}
      </span>
    ),
  },
  {
    accessorKey: 'email',
    header: '이메일',
    cell: ({ row }) => {
      const email = row.getValue('email') as string;

      return (
        <a
          href={`mailto:${email}`}
          onClick={(e) => e.stopPropagation()}
          className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline">
          {email}
        </a>
      );
    },
  },
  {
    accessorKey: 'clubJoinDate',
    header: '가입일',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.getValue('clubJoinDate')}
      </span>
    ),
  },
];
