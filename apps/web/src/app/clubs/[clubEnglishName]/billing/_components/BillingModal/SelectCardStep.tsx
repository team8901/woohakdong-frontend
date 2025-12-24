import {
  BILLING_PAYMENT_METHODS,
  type PaymentMethodId,
} from '@/app/payment/_helpers/constants/portone';
import { Button } from '@workspace/ui/components/button';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Wallet } from 'lucide-react';

import { PaymentMethodIcon } from '../../_helpers/utils/paymentMethodIcon';

type SelectCardStepProps = {
  isMockMode: boolean;
  isProcessing: boolean;
  onRegisterPaymentMethod: (methodId: PaymentMethodId) => void;
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
          정기 결제에 사용할 결제수단을 선택해주세요.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        {BILLING_PAYMENT_METHODS.map((method) => (
          <Button
            key={method.id}
            variant="outline"
            className="hover:border-primary h-auto w-full justify-start p-4 transition-colors"
            onClick={() => onRegisterPaymentMethod(method.id)}
            disabled={isProcessing}>
            <PaymentMethodIcon
              cardCompany={method.icon}
              size={20}
              className="mr-3"
            />
            <div className="text-left">
              <p className="font-medium">{method.label}</p>
              <p className="text-muted-foreground text-sm">
                {method.description}
              </p>
            </div>
          </Button>
        ))}
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
