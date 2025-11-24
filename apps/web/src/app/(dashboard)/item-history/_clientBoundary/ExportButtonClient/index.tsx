'use client';

import { getKeyByValue } from '@/_shared/helpers/utils/getKeyByValue';
import { CLUB_ITEM_CATEGORY } from '@/app/(dashboard)/item/_helpers/constants/clubItemCategory';
import { getHistoryRentalStatusText } from '@/app/(dashboard)/item-history/_helpers/utils/getHistoryRentalStatusText';
import { type ClubItemHistoryResponse } from '@/data/club/getClubItemHistory/type';
import { Button } from '@workspace/ui/components/button';
import { DownloadIcon } from 'lucide-react';
import * as XLSX from 'xlsx';

type Props = {
  items: ClubItemHistoryResponse[];
  selectedItems: ClubItemHistoryResponse[];
};

export const ExportButtonClient = ({ items, selectedItems }: Props) => {
  const handleExport = () => {
    // 선택된 항목이 없거나 전체 선택된 경우 전체 내보내기, 아니면 선택된 항목만 내보내기
    const dataToExport =
      selectedItems.length === 0 || selectedItems.length === items.length
        ? items
        : selectedItems;

    // 데이터를 Excel 형식으로 변환
    const data = dataToExport.map((item) => ({
      물품명: item.name,
      카테고리: getKeyByValue(CLUB_ITEM_CATEGORY, item.category),
      대여상태: getHistoryRentalStatusText(item),
      대여날짜: item.rentalDate ?? '-',
      반납날짜: item.returnDate ?? '-',
    }));

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 컬럼 너비 설정
    worksheet['!cols'] = [
      { wch: 20 }, // 물품명
      { wch: 12 }, // 카테고리
      { wch: 12 }, // 대여상태
      { wch: 15 }, // 대여날짜
      { wch: 15 }, // 반납날짜
    ];

    // 워크북 생성
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, '대여 내역');

    // 파일 다운로드
    const fileName = `대여_내역_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Button type="button" variant="secondary" onClick={handleExport}>
      <DownloadIcon />
      내보내기
    </Button>
  );
};
