import { Button } from '@workspace/ui/components/button';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { MessageCircle, Wallet } from 'lucide-react';

type SelectCardStepProps = {
  isMockMode: boolean;
  isProcessing: boolean;
  onRegisterPaymentMethod: () => void;
  onRegisterMockCard: () => void;
  onClose: () => void;
};

export const SelectCardStep = ({
  isMockMode,
  isProcessing,
  onRegisterPaymentMethod,
  onRegisterMockCard,
  onClose,
}: SelectCardStepProps) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>결제수단 등록</DialogTitle>
        <DialogDescription>
          정기 결제에 사용할 결제수단을 등록해주세요.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <Button
          variant="outline"
          className="hover:border-primary h-auto w-full justify-start p-4 transition-colors"
          onClick={onRegisterPaymentMethod}
          disabled={isProcessing}>
          <MessageCircle className="mr-3 size-5 text-yellow-500" />
          <div className="text-left">
            <p className="font-medium">카카오페이</p>
            <p className="text-muted-foreground text-sm">
              카카오페이로 정기 결제
            </p>
          </div>
        </Button>
        {isMockMode && (
          <Button
            variant="ghost"
            className="text-muted-foreground h-auto w-full justify-start p-4"
            onClick={onRegisterMockCard}
            disabled={isProcessing}>
            <Wallet className="mr-3 size-5 opacity-50" />
            <div className="text-left">
              <p className="font-medium">모의 결제수단 (테스트용)</p>
              <p className="text-muted-foreground text-sm">
                테스트용 가상 결제수단을 등록합니다
              </p>
            </div>
          </Button>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          취소
        </Button>
      </DialogFooter>
    </>
  );
};
