import type { BillingKey } from '@workspace/firebase/subscription';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Separator } from '@workspace/ui/components/separator';
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '@workspace/ui/constants/plans';
import {
  Check,
  CreditCard,
  MessageCircle,
  Plus,
  ShoppingBag,
} from 'lucide-react';

type ConfirmStepProps = {
  selectedPlan: SubscriptionPlanId;
  isYearly: boolean;
  defaultBillingKey: BillingKey | null;
  onPayment: () => void;
  onSelectCard: () => void;
  onClose: () => void;
};

const getPaymentMethodIcon = (cardCompany: string) => {
  const lowerName = cardCompany.toLowerCase();

  if (lowerName.includes('카카오')) {
    return <MessageCircle className="size-4 text-yellow-500" />;
  }

  if (lowerName.includes('네이버')) {
    return <ShoppingBag className="size-4 text-green-500" />;
  }

  return <CreditCard className="size-4 text-blue-500" />;
};

export const ConfirmStep = ({
  selectedPlan,
  isYearly,
  defaultBillingKey,
  onPayment,
  onSelectCard,
  onClose,
}: ConfirmStepProps) => {
  const plan = SUBSCRIPTION_PLANS[selectedPlan];
  const billingPrice = isYearly
    ? plan.yearlyPrice * 12
    : plan.monthlyPrice;
  const billingCycle = isYearly ? '연' : '월';
  const isFree = plan.monthlyPrice === 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle>결제 확인</DialogTitle>
        <DialogDescription>
          아래 내용을 확인하고 결제를 진행해주세요.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {/* 플랜 정보 */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-medium">{plan.name} 플랜</span>
            {plan.recommended && <Badge variant="secondary">인기</Badge>}
          </div>
          <ul className="mb-3 space-y-1">
            {plan.features.slice(0, 3).map((feature, idx) => (
              <li
                key={idx}
                className="text-muted-foreground flex items-center gap-2 text-sm">
                <Check className="size-3 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <Separator className="my-3" />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {isYearly ? '연간' : '월간'} 결제 금액
            </span>
            <span className="text-primary text-lg font-bold">
              {isFree ? '무료' : `${billingPrice.toLocaleString()}원`}
            </span>
          </div>
          {isYearly && !isFree && (
            <p className="text-muted-foreground mt-1 text-right text-xs">
              월 {plan.yearlyPrice.toLocaleString()}원 ×12개월
            </p>
          )}
        </div>

        {/* 결제 수단 */}
        {!isFree && (
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-muted-foreground text-sm">결제수단</span>
              {defaultBillingKey && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs"
                  onClick={onSelectCard}>
                  변경
                </Button>
              )}
            </div>
            {defaultBillingKey ? (
              <div className="flex items-center gap-3">
                {getPaymentMethodIcon(defaultBillingKey.cardCompany)}
                <div>
                  <p className="font-medium">{defaultBillingKey.cardCompany}</p>
                  {defaultBillingKey.cardNumber && (
                    <p className="text-muted-foreground text-sm">
                      {defaultBillingKey.cardNumber}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={onSelectCard}>
                <Plus className="mr-2 size-4" />
                결제수단 등록하기
              </Button>
            )}
          </div>
        )}
      </div>
      <DialogFooter className="flex-col gap-2 sm:flex-col">
        <Button
          className="w-full"
          size="lg"
          onClick={onPayment}
          disabled={!defaultBillingKey && !isFree}>
          {isFree
            ? '무료 플랜으로 변경'
            : `${billingPrice.toLocaleString()}원/${billingCycle} 결제하기`}
        </Button>
        <Button variant="ghost" className="w-full" onClick={onClose}>
          취소
        </Button>
      </DialogFooter>
    </>
  );
};
