'use client';

import { useState } from 'react';

import { Card, CardContent } from '@workspace/ui/components/card';
import {
  BillingCycleToggle,
  EnterprisePlanCard,
  PlanCard,
} from '@workspace/ui/components/plan-card';
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '@workspace/ui/constants/plans';
import { AlertCircle } from 'lucide-react';

type PlansTabProps = {
  currentPlanId: SubscriptionPlanId;
  isPaidPlanDisabled: boolean;
  /** 구독이 취소되어 만료 후 무료 플랜으로 전환 예정인지 */
  isCanceledAndPendingFree?: boolean;
  /** 예약된 플랜 ID (다음 결제일에 변경 예정) */
  scheduledPlanId?: SubscriptionPlanId;
  /** 구독 유지하기 (취소 철회) */
  onReactivate?: () => void;
  isReactivating?: boolean;
  onOpenModal: (plan: SubscriptionPlanId, isYearly: boolean) => void;
};

// 엔터프라이즈를 제외한 일반 플랜
const REGULAR_PLAN_IDS = (
  Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlanId[]
).filter((key) => !SUBSCRIPTION_PLANS[key].contactOnly);

export const PlansTab = ({
  currentPlanId,
  isPaidPlanDisabled,
  isCanceledAndPendingFree,
  scheduledPlanId,
  onReactivate,
  isReactivating,
  onOpenModal,
}: PlansTabProps) => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="space-y-6">
      {isPaidPlanDisabled && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">
                유료 플랜 결제 준비 중
              </p>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                현재 유료 플랜 결제 기능을 준비하고 있습니다. 빠른 시일 내에
                제공될 예정입니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 월간/연간 토글 */}
      <div className="flex justify-center">
        <BillingCycleToggle isYearly={isYearly} onChange={setIsYearly} />
      </div>

      {/* 일반 플랜 그리드 */}
      <div className="grid gap-6 md:grid-cols-3">
        {REGULAR_PLAN_IDS.map((planId) => {
          const plan = SUBSCRIPTION_PLANS[planId];
          const isCurrentPlan = currentPlanId === planId;
          const isPaidPlan = plan.monthlyPrice > 0;
          const isFreePlan = plan.monthlyPrice === 0;
          const isComingSoon = plan.comingSoon;
          const isDisabled = isPaidPlanDisabled && isPaidPlan;

          // 무료 플랜이고 취소된 구독이 만료 후 무료로 전환 예정
          const isPendingFree = isFreePlan && isCanceledAndPendingFree;

          // 이 플랜으로 변경이 예약되어 있는지
          const isScheduledPlan =
            scheduledPlanId?.toUpperCase() === planId.toUpperCase();

          // 취소된 현재 플랜은 재구독 가능
          const canReactivate = isCurrentPlan && isCanceledAndPendingFree;

          // 유료 플랜 구독 중이면 무료 플랜 버튼 숨김 (구독 취소는 오버뷰에서)
          const hideFreePlanButton =
            isFreePlan && currentPlanId !== 'FREE' && !isCanceledAndPendingFree;

          // 버튼 표시 조건:
          // - 현재 플랜이 아니고 무료 플랜 버튼 숨김이 아니면 표시
          // - 취소된 현재 플랜이면 표시 (재구독)
          // - 예약된 플랜이면 버튼 숨김
          const showButton =
            ((!isCurrentPlan && !hideFreePlanButton) || canReactivate) &&
            !isScheduledPlan;

          return (
            <PlanCard
              key={planId}
              planId={planId}
              isYearly={isYearly}
              isCurrentPlan={isCurrentPlan}
              isComingSoon={isComingSoon || isDisabled || isReactivating}
              isPendingPlan={isPendingFree || isScheduledPlan}
              canReactivate={canReactivate}
              actionLabel={canReactivate ? '구독 유지하기' : undefined}
              showActionButton={showButton}
              onAction={
                canReactivate && onReactivate
                  ? onReactivate
                  : () => onOpenModal(planId, isYearly)
              }
            />
          );
        })}
      </div>

      {/* 엔터프라이즈 플랜 */}
      <EnterprisePlanCard variant="dashed" />
    </div>
  );
};
