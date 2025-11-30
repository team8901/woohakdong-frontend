'use client';

import { exportToExcel } from '@/_shared/helpers/utils/exportToExcel';
import { getKeyByValue } from '@/_shared/helpers/utils/getKeyByValue';
import { CLUB_ITEM_CATEGORY } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/clubItemCategory';
import { ITEM_EXPORT_CONFIG } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/itemExportConfig';
import { getRentalStatusLabel } from '@/app/clubs/[clubEnglishName]/item/_helpers/utils/getRentalStatusLabel';
import { type ClubItemResponse } from '@/data/club/getClubItems/type';
import { Button } from '@workspace/ui/components/button';
import { DownloadIcon } from 'lucide-react';

type Props = {
  items: ClubItemResponse[];
  selectedItems: ClubItemResponse[];
};

export const ExportButtonClient = ({ items, selectedItems }: Props) => {
  const handleExport = () => {
    exportToExcel({
      allData: items,
      selectedData: selectedItems,
      dataMapper: (item) => ({
        물품명: item.name,
        카테고리: getKeyByValue(CLUB_ITEM_CATEGORY, item.category) ?? '',
        위치: item.location,
        대여상태: getRentalStatusLabel(item) ?? '',
        반납예정날짜: item.rentalDate ?? '-',
        대여가능일수: item.rentalMaxDay,
      }),
      columnWidths: ITEM_EXPORT_CONFIG.columnWidths,
      sheetName: ITEM_EXPORT_CONFIG.sheetName,
      fileNamePrefix: ITEM_EXPORT_CONFIG.fileNamePrefix,
    });
  };

  return (
    <Button type="button" variant="secondary" onClick={handleExport}>
      <DownloadIcon />
      내보내기
    </Button>
  );
};
