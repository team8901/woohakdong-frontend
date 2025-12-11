import { Button } from '@workspace/ui/components/button';
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { AlertCircle } from 'lucide-react';

type ErrorStepProps = {
  errorMessage: string | null;
  onRetry: () => void;
  onClose: () => void;
};

export const ErrorStep = ({
  errorMessage,
  onRetry,
  onClose,
}: ErrorStepProps) => {
  return (
    <>
      <DialogHeader className="sr-only">
        <DialogTitle>오류 발생</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center py-8">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <AlertCircle className="size-6 text-red-600 dark:text-red-400" />
        </div>
        <p className="font-medium text-red-600 dark:text-red-400">오류 발생</p>
        <p className="text-muted-foreground text-center text-sm">
          {errorMessage ?? '알 수 없는 오류가 발생했습니다.'}
        </p>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
        <Button onClick={onRetry}>다시 시도</Button>
      </DialogFooter>
    </>
  );
};
