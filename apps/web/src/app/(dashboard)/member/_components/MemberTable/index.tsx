'use client';

import { useEffect, useState } from 'react';

import { type ClubMembersResponse } from '@/data/club/getClubMembers/type';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';

import { columns } from './columns';

type Props = {
  members: ClubMembersResponse[];
  onSelectionChange?: (selectedMembers: ClubMembersResponse[]) => void;
};

export const MemberTable = ({ members, onSelectionChange }: Props) => {
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  });

  useEffect(() => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedMembers = selectedRows.map((row) => row.original);

    onSelectionChange?.(selectedMembers);
  }, [rowSelection, onSelectionChange, table]);

  return (
    <div className="w-full overflow-auto rounded-lg border bg-white">
      <Table>
        <TableHeader className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-gray-50">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="h-12 px-6 text-xs font-semibold uppercase tracking-wide text-gray-700">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="group">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="h-14 px-6 text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-sm text-gray-500">
                결과가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
