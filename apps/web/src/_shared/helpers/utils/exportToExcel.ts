import * as XLSX from 'xlsx';

type ExportToExcelOptions<T> = {
  allData: T[];
  selectedData: T[];
  dataMapper: (item: T) => Record<string, string | number | undefined>;
  columnWidths: readonly number[];
  sheetName: string;
  fileNamePrefix: string;
};

/**
 * 데이터를 Excel 파일로 내보내기
 * @param options - 내보내기 옵션
 * @param options.allData - 전체 데이터 배열
 * @param options.selectedData - 선택된 데이터 배열
 * @param options.dataMapper - 데이터를 Excel 형식으로 변환하는 함수
 * @param options.columnWidths - 각 컬럼의 너비 배열
 * @param options.sheetName - Excel 시트 이름
 * @param options.fileNamePrefix - 파일명 접두사
 */
export const exportToExcel = <T>({
  allData,
  selectedData,
  dataMapper,
  columnWidths,
  sheetName,
  fileNamePrefix,
}: ExportToExcelOptions<T>) => {
  // 선택된 항목이 없거나 전체 선택된 경우 전체 내보내기, 아니면 선택된 항목만 내보내기
  const dataToExport =
    selectedData.length === 0 || selectedData.length === allData.length
      ? allData
      : selectedData;

  // 데이터를 Excel 형식으로 변환
  const data = dataToExport.map(dataMapper);

  // 워크시트 생성
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 컬럼 너비 설정
  worksheet['!cols'] = columnWidths.map((wch) => ({ wch }));

  // 워크북 생성
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 파일 다운로드
  const fileName = `${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};
