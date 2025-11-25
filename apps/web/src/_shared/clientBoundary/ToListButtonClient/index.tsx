'use client';

import { Button } from '@workspace/ui/components/button';
import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const ToListButtonClient = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <Button variant="ghost" onClick={handleBackClick}>
      <ArrowLeftIcon />
      목록으로
    </Button>
  );
};
