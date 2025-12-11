import { Button } from '@workspace/ui/components/button';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { CreditCard, Plus } from 'lucide-react';

type SelectCardStepProps = {
  isMockMode: boolean;
  isProcessing: boolean;
  onRegisterRealCard: () => void;
  onRegisterMockCard: () => void;
  onClose: () => void;
};

export const SelectCardStep = ({
  isMockMode,
  isProcessing,
  onRegisterRealCard,
  onRegisterMockCard,
  onClose,
}: SelectCardStepProps) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>결제 수단 등록</DialogTitle>
        <DialogDescription>
          정기 결제를 위한 카드를 등록해주세요.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <Button
          variant="outline"
          className="h-auto w-full justify-start p-4"
          onClick={onRegisterRealCard}
          disabled={isProcessing}>
          <Plus className="mr-3 size-5" />
          <div className="text-left">
            <p className="font-medium">새 카드 등록</p>
            <p className="text-muted-foreground text-sm">
              신용/체크카드를 등록합니다
            </p>
          </div>
        </Button>
        {isMockMode && (
          <Button
            variant="outline"
            className="h-auto w-full justify-start p-4"
            onClick={onRegisterMockCard}
            disabled={isProcessing}>
            <CreditCard className="mr-3 size-5" />
            <div className="text-left">
              <p className="font-medium">모의 카드 등록</p>
              <p className="text-muted-foreground text-sm">
                테스트용 가상 카드를 등록합니다
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
