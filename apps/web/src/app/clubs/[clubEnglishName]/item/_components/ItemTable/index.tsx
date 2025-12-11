'use client';

import { useEffect, useState } from 'react';

import { ItemDetailDialogClient } from '@/app/clubs/[clubEnglishName]/item/_clientBoundary/ItemDetailDialogClient';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { type ClubItemResponse } from '@workspace/api/generated';
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
  items: ClubItemResponse[];
  clubId: number;
  onSelectionChange?: (selectedItems: ClubItemResponse[]) => void;
};

export const ItemTable = ({ items, clubId, onSelectionChange }: Props) => {
  const [rowSelection, setRowSelection] = useState({});
  const [selectedItem, setSelectedItem] = useState<ClubItemResponse | null>(
    null,
  );

  const table = useReactTable({
    data: items,
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
    const selectedItems = selectedRows.map((row) => row.original);

    onSelectionChange?.(selectedItems);
  }, [rowSelection, onSelectionChange, table]);

  return (
    <div className="bg-background w-full overflow-auto rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="text-muted-foreground h-11 px-4 text-xs font-medium">
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
                className="hover:bg-muted/50 group cursor-pointer transition-colors"
                onClick={() => setSelectedItem(row.original)}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-muted-foreground h-32 text-center text-sm">
                결과가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedItem && (
        <ItemDetailDialogClient
          clubId={clubId}
          item={selectedItem}
          open={selectedItem !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
};
