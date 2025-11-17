'use client';

import { Button } from '@workspace/ui/components/button';

export const GroupButtonsClient = () => {
  return (
    <div className="text-muted-foreground inline-flex w-fit rounded-md rtl:space-x-reverse">
      <Button
        variant="ghost"
        onClick={() => {}}
        className="rounded-none rounded-l-md shadow-none focus-visible:z-10">
        고정
      </Button>
      <Button
        variant="ghost"
        onClick={() => {}}
        className="rounded-none shadow-none focus-visible:z-10">
        수정
      </Button>
      <Button
        variant="ghost"
        onClick={() => {}}
        className="rounded-none rounded-r-md shadow-none focus-visible:z-10">
        삭제
      </Button>
    </div>
  );
};
