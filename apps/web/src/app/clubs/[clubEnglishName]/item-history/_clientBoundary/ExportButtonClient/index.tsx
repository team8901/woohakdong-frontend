'use client';

import { exportToExcel } from '@/_shared/helpers/utils/exportToExcel';
import { getKeyByValue } from '@/_shared/helpers/utils/getKeyByValue';
import { CLUB_ITEM_CATEGORY } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/clubItemCategory';
import { ITEM_HISTORY_EXPORT_CONFIG } from '@/app/clubs/[clubEnglishName]/item-history/_helpers/constants/itemHistoryExportConfig';
import { getHistoryRentalStatusLabel } from '@/app/clubs/[clubEnglishName]/item-history/_helpers/utils/getHistoryRentalStatusLabel';
import { type ClubItemHistoryResponse } from '@workspace/api/generated';
import { Button } from '@workspace/ui/components/button';
import { DownloadIcon } from 'lucide-react';

type Props = {
  items: ClubItemHistoryResponse[];
  selectedItems: ClubItemHistoryResponse[];
};

export const ExportButtonClient = ({ items, selectedItems }: Props) => {
  const handleExport = () => {
    exportToExcel({
      allData: items,
      selectedData: selectedItems,
      dataMapper: (item) => ({
        물품명: item.name ?? '',
        카테고리: item.category
          ? (getKeyByValue(CLUB_ITEM_CATEGORY, item.category) ?? '')
          : '',
        대여상태: getHistoryRentalStatusLabel(item) ?? '',
        대여날짜: item.rentalDate ?? '-',
        반납날짜: item.returnDate ?? '-',
      }),
      columnWidths: ITEM_HISTORY_EXPORT_CONFIG.columnWidths,
      sheetName: ITEM_HISTORY_EXPORT_CONFIG.sheetName,
      fileNamePrefix: ITEM_HISTORY_EXPORT_CONFIG.fileNamePrefix,
    });
  };

  return (
    <Button type="button" variant="secondary" onClick={handleExport}>
      <DownloadIcon />
      내보내기
    </Button>
  );
};
