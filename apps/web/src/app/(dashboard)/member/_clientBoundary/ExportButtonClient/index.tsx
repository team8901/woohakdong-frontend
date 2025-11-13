'use client';

import { Button } from '@workspace/ui/components/button';
import { DownloadIcon } from 'lucide-react';

type Props = {
  // TODO: 타입 변경
  members: string[];
};

export const ExportButtonClient = ({ members }: Props) => {
  // TODO: 엑셀로 내보내기 기능 구현
  const handleExport = () => {
    console.log('내보내기 클릭됨', members);
  };

  return (
    <Button type="button" variant="secondary" onClick={handleExport}>
      <DownloadIcon />
      내보내기
    </Button>
  );
};
