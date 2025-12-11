import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '@/app/payment/_helpers/constants/plans';
import type { BillingKey } from '@workspace/firebase/subscription';
import { Button } from '@workspace/ui/components/button';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Separator } from '@workspace/ui/components/separator';
import { CreditCard, Plus } from 'lucide-react';

type ConfirmStepProps = {
  selectedPlan: SubscriptionPlanId;
  defaultBillingKey: BillingKey | null;
  onPayment: () => void;
  onSelectCard: () => void;
  onClose: () => void;
};

export const ConfirmStep = ({
  selectedPlan,
  defaultBillingKey,
  onPayment,
  onSelectCard,
  onClose,
}: ConfirmStepProps) => {
  const plan = SUBSCRIPTION_PLANS[selectedPlan];

  return (
    <>
      <DialogHeader>
        <DialogTitle>플랜 변경 확인</DialogTitle>
        <DialogDescription>
          {plan.name} 플랜으로 변경합니다.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">변경할 플랜</span>
            <span className="font-medium">{plan.name}</span>
          </div>
          <Separator className="my-3" />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">결제 금액</span>
            <span className="text-primary font-bold">
              {plan.basePrice === 0
                ? '무료'
                : `${plan.basePrice.toLocaleString()}원/월`}
            </span>
          </div>
        </div>
        {defaultBillingKey && plan.basePrice > 0 && (
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground mb-1 text-xs">결제 카드</p>
            <div className="flex items-center gap-2">
              <CreditCard className="size-4" />
              <span className="text-sm">
                {defaultBillingKey.cardCompany} {defaultBillingKey.cardNumber}
              </span>
            </div>
          </div>
        )}
        {!defaultBillingKey && plan.basePrice > 0 && (
          <Button variant="outline" className="w-full" onClick={onSelectCard}>
            <Plus className="mr-2 size-4" />
            카드 등록하기
          </Button>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button
          onClick={onPayment}
          disabled={!defaultBillingKey && plan.basePrice > 0}>
          {plan.basePrice === 0
            ? '플랜 변경'
            : `${plan.basePrice.toLocaleString()}원 결제하기`}
        </Button>
      </DialogFooter>
    </>
  );
};
