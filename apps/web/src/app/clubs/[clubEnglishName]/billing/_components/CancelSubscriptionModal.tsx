import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';

type CancelSubscriptionModalProps = {
  isOpen: boolean;
  isProcessing: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export const CancelSubscriptionModal = ({
  isOpen,
  isProcessing,
  onConfirm,
  onClose,
}: CancelSubscriptionModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="size-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="text-center">
            정말 구독을 취소하시겠습니까?
          </DialogTitle>
          <DialogDescription className="text-center">
            구독을 취소하면 현재 결제 기간이 종료된 후 무료 플랜으로 전환됩니다.
            <br />
            무료 플랜에서는 일부 기능이 제한될 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-muted-foreground text-sm">
            <strong className="text-foreground">참고:</strong> 구독 취소 후에도
            남은 결제 기간 동안은 현재 플랜의 모든 기능을 이용할 수 있습니다.
          </p>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            variant="destructive"
            className="w-full"
            onClick={onConfirm}
            disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                처리 중...
              </>
            ) : (
              '구독 취소'
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
            disabled={isProcessing}>
            계속 이용하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
