'use client';

import { type ClubItemResponse } from '@/data/club/getClubItems/type';
import { Button } from '@workspace/ui/components/button';
import { DownloadIcon } from 'lucide-react';

type Props = {
  items: ClubItemResponse[];
};

export const ExportButtonClient = ({ items }: Props) => {
  // TODO: 엑셀로 내보내기 기능 구현
  const handleExport = () => {
    console.log('내보내기 클릭됨', items);
  };

  return (
    <Button type="button" variant="secondary" onClick={handleExport}>
      <DownloadIcon />
      내보내기
    </Button>
  );
};
