import {
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Loader2 } from 'lucide-react';

export const ProcessingStep = () => {
  return (
    <>
      <DialogHeader className="sr-only">
        <DialogTitle>처리 중</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="text-primary mb-4 size-12 animate-spin" />
        <p className="font-medium">처리 중...</p>
        <p className="text-muted-foreground text-sm">잠시만 기다려주세요.</p>
      </div>
    </>
  );
};
