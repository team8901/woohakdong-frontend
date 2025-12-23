import { useState } from 'react';

import type { ProrationResult } from '@/app/payment/_helpers/utils/proration';
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
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  MessageCircle,
  Plus,
  ShoppingBag,
} from 'lucide-react';

type ConfirmStepProps = {
  selectedPlan: SubscriptionPlanId;
  currentPlanId?: SubscriptionPlanId;
  isYearly: boolean;
  billingKeys: BillingKey[];
  selectedBillingKey: BillingKey | null;
  /** 비례 정산 정보 (업그레이드 시) */
  proration?: ProrationResult | null;
  onSelectBillingKey: (billingKey: BillingKey) => void;
  onPayment: () => void;
  onRegisterCard: () => void;
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
  currentPlanId,
  isYearly,
  billingKeys,
  selectedBillingKey,
  proration,
  onSelectBillingKey,
  onPayment,
  onRegisterCard,
  onClose,
}: ConfirmStepProps) => {
  const [isCardListOpen, setIsCardListOpen] = useState(false);

  const plan = SUBSCRIPTION_PLANS[selectedPlan];
  const currentPlan = currentPlanId ? SUBSCRIPTION_PLANS[currentPlanId] : null;
  const billingPrice = isYearly ? plan.yearlyPrice * 12 : plan.monthlyPrice;
  const billingCycle = isYearly ? '연' : '월';
  const isFree = plan.monthlyPrice === 0;
  const hasMultipleCards = billingKeys.length > 1;

  // 비례 정산이 있는 경우 (업그레이드)
  const hasProration = proration && proration.isUpgrade && proration.amountDue > 0;
  const amountToPay = hasProration ? proration.amountDue : billingPrice;

  return (
    <>
      <DialogHeader>
        <DialogTitle>결제 확인</DialogTitle>
        <DialogDescription>
          아래 내용을 확인하고 결제를 진행해주세요.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {/* 플랜 변경 정보 (업그레이드 시) */}
        {hasProration && currentPlan && (
          <div className="bg-primary/5 flex items-center justify-center gap-2 rounded-lg p-3">
            <span className="text-muted-foreground text-sm">
              {currentPlan.name}
            </span>
            <ArrowRight className="text-primary size-4" />
            <span className="text-primary font-medium">{plan.name}</span>
          </div>
        )}

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

          {/* 비례 정산 상세 (업그레이드 시) */}
          {hasProration && proration ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {plan.name} 플랜 ({proration.remainingDays}일)
                </span>
                <span>{proration.newPlanCost.toLocaleString()}원</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {currentPlan?.name} 미사용 크레딧
                </span>
                <span className="text-green-600">
                  -{proration.currentPlanCredit.toLocaleString()}원
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="font-medium">오늘 결제 금액</span>
                <span className="text-primary text-lg font-bold">
                  {proration.amountDue.toLocaleString()}원
                </span>
              </div>
              <p className="text-muted-foreground text-right text-xs">
                다음 결제일({proration.nextBillingDate.toLocaleDateString('ko-KR')})부터{' '}
                {billingPrice.toLocaleString()}원/{billingCycle}
              </p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* 결제 수단 */}
        {!isFree && (
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-muted-foreground text-sm">결제수단</span>
              {hasMultipleCards && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-auto gap-1 p-0 text-xs"
                  onClick={() => setIsCardListOpen(!isCardListOpen)}>
                  {isCardListOpen ? '접기' : '변경'}
                  {isCardListOpen ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  )}
                </Button>
              )}
            </div>

            {selectedBillingKey ? (
              <>
                {/* 선택된 카드 표시 */}
                <div className="flex items-center gap-3">
                  {getPaymentMethodIcon(selectedBillingKey.cardCompany)}
                  <div>
                    <p className="font-medium">
                      {selectedBillingKey.cardCompany}
                    </p>
                    {selectedBillingKey.cardNumber && (
                      <p className="text-muted-foreground text-sm">
                        {selectedBillingKey.cardNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* 카드 목록 (펼쳤을 때) */}
                {isCardListOpen && hasMultipleCards && (
                  <div className="mt-3 space-y-2 border-t pt-3">
                    {billingKeys.map((key) => (
                      <button
                        key={key.id}
                        type="button"
                        className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                          selectedBillingKey.id === key.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => {
                          onSelectBillingKey(key);
                          setIsCardListOpen(false);
                        }}>
                        {getPaymentMethodIcon(key.cardCompany)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {key.cardCompany}
                          </p>
                          {key.cardNumber && (
                            <p className="text-muted-foreground text-xs">
                              {key.cardNumber}
                            </p>
                          )}
                        </div>
                        {selectedBillingKey.id === key.id && (
                          <Check className="text-primary size-4" />
                        )}
                      </button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={onRegisterCard}>
                      <Plus className="mr-2 size-4" />새 결제수단 등록
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={onRegisterCard}>
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
          disabled={!selectedBillingKey && !isFree}>
          {isFree
            ? '무료로 시작하기'
            : hasProration
              ? `${amountToPay.toLocaleString()}원 결제하기`
              : `${billingPrice.toLocaleString()}원/${billingCycle} 결제하기`}
        </Button>
        <Button variant="ghost" className="w-full" onClick={onClose}>
          취소
        </Button>
      </DialogFooter>
    </>
  );
};
