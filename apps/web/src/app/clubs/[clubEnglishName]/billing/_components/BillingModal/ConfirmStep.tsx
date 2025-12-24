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
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';

import { PaymentMethodIcon } from '../../_helpers/utils/paymentMethodIcon';

type ConfirmStepProps = {
  selectedPlan: SubscriptionPlanId;
  currentPlanId?: SubscriptionPlanId;
  isYearly: boolean;
  billingKeys: BillingKey[];
  selectedBillingKey: BillingKey | null;
  /** 비례 정산 정보 (업그레이드 시) */
  proration?: ProrationResult | null;
  /** 예약 변경 시 적용일 (현재 구독 종료일) */
  scheduledDate?: string;
  onSelectBillingKey: (billingKey: BillingKey) => void;
  onPayment: () => void;
  onRegisterCard: () => void;
  onClose: () => void;
};

export const ConfirmStep = ({
  selectedPlan,
  currentPlanId,
  isYearly,
  billingKeys,
  selectedBillingKey,
  proration,
  scheduledDate,
  onSelectBillingKey,
  onPayment,
  onRegisterCard,
  onClose,
}: ConfirmStepProps) => {
  const [isCardListOpen, setIsCardListOpen] = useState(false);

  const plan = SUBSCRIPTION_PLANS[selectedPlan];
  const currentPlan = currentPlanId ? SUBSCRIPTION_PLANS[currentPlanId] : null;
  const billingPrice = isYearly ? plan.monthlyPriceYearly * 12 : plan.monthlyPrice;
  const billingCycle = isYearly ? '연' : '월';
  const isFree = plan.monthlyPrice === 0;
  const hasMultipleCards = billingKeys.length > 1;

  // 비례 정산이 있는 경우 (업그레이드 또는 빌링 주기 변경)
  const hasProration =
    proration && (proration.isUpgrade || proration.isBillingCycleChange);
  const amountToPay = hasProration ? proration.amountDue : billingPrice;

  // 예약 변경인 경우 (다운그레이드, 빌링 주기 동일)
  const isScheduledChange =
    proration && !proration.isUpgrade && !proration.isBillingCycleChange;

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isScheduledChange ? '플랜 변경 예약' : '결제 확인'}
        </DialogTitle>
        <DialogDescription>
          {isScheduledChange
            ? '다음 결제일부터 새로운 플랜이 적용됩니다.'
            : '아래 내용을 확인하고 결제를 진행해주세요.'}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {/* 예약 변경 안내 */}
        {isScheduledChange && scheduledDate && (
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
            <Calendar className="size-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">
                {scheduledDate}부터 적용
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                현재 플랜은 해당 날짜까지 그대로 유지됩니다.
              </p>
            </div>
          </div>
        )}

        {/* 플랜/빌링 주기 변경 정보 */}
        {(hasProration || isScheduledChange) && proration && (
          <div className="bg-primary/5 flex items-center justify-center gap-2 rounded-lg p-3">
            <span className="text-muted-foreground text-sm">
              {currentPlan?.name ?? '현재 플랜'}
              {proration.isBillingCycleChange && !proration.isUpgrade && (
                <span className="ml-1">
                  ({proration.isBillingCycleChange && !isYearly ? '연간' : '월간'})
                </span>
              )}
            </span>
            <ArrowRight className="text-primary size-4" />
            <span className="text-primary font-medium">
              {plan.name}
              {proration.isBillingCycleChange && (
                <span className="ml-1">({isYearly ? '연간' : '월간'})</span>
              )}
            </span>
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

          {/* 예약 변경 시 가격 정보 */}
          {isScheduledChange ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {scheduledDate}부터 결제 금액
                </span>
                <span className="text-primary text-lg font-bold">
                  {billingPrice.toLocaleString()}원/{billingCycle}
                </span>
              </div>
              {isYearly && (
                <p className="text-muted-foreground text-right text-xs">
                  월 {plan.monthlyPriceYearly.toLocaleString()}원 ×12개월
                </p>
              )}
              <p className="text-muted-foreground text-sm">
                오늘 추가 결제는 없습니다. 현재 결제 주기가 끝나면 새로운 플랜으로 자동 결제됩니다.
              </p>
            </div>
          ) : hasProration && proration ? (
            /* 비례 정산 상세 (업그레이드 또는 빌링 주기 변경 시) */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {proration.isBillingCycleChange
                    ? `${plan.name} 플랜 (${isYearly ? '연간' : '월간'})`
                    : `${plan.name} 플랜 (${proration.remainingDays}일)`}
                </span>
                <span>{proration.newPlanCost.toLocaleString()}원</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  기존 구독 크레딧
                </span>
                <span className="text-green-600">
                  -{proration.currentPlanCredit.toLocaleString()}원
                </span>
              </div>
              {/* 기존 보유 크레딧 표시 */}
              {proration.existingCredit > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    보유 크레딧
                  </span>
                  <span className="text-green-600">
                    -{proration.existingCredit.toLocaleString()}원
                  </span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="font-medium">오늘 결제 금액</span>
                <span className="text-primary text-lg font-bold">
                  {proration.amountDue === 0
                    ? '무료'
                    : `${proration.amountDue.toLocaleString()}원`}
                </span>
              </div>
              {/* 남은 크레딧 표시 */}
              {proration.remainingCredit > 0 && (
                <div className="bg-green-50 dark:bg-green-950 rounded-md p-2">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    💰 남은 크레딧 {proration.remainingCredit.toLocaleString()}원은
                    다음 결제에서 자동 차감됩니다.
                  </p>
                </div>
              )}
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
                  월 {plan.monthlyPriceYearly.toLocaleString()}원 ×12개월
                </p>
              )}
            </>
          )}
        </div>

        {/* 결제 수단 (예약 변경이 아닌 경우에만 표시) */}
        {!isFree && !isScheduledChange && (
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
                  <PaymentMethodIcon
                    cardCompany={selectedBillingKey.cardCompany}
                    className="size-4"
                  />
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
                        <PaymentMethodIcon
                          cardCompany={key.cardCompany}
                          className="size-4"
                        />
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
          disabled={!isScheduledChange && !selectedBillingKey && !isFree && amountToPay > 0}>
          {isScheduledChange
            ? '플랜 변경 예약하기'
            : isFree
              ? '무료로 시작하기'
              : hasProration
                ? amountToPay === 0
                  ? '크레딧으로 전환하기'
                  : `${amountToPay.toLocaleString()}원 결제하기`
                : `${billingPrice.toLocaleString()}원/${billingCycle} 결제하기`}
        </Button>
        <Button variant="ghost" className="w-full" onClick={onClose}>
          취소
        </Button>
      </DialogFooter>
    </>
  );
};
