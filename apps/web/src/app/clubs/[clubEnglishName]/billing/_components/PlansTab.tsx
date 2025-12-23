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
  onOpenModal: (plan: SubscriptionPlanId, isYearly: boolean) => void;
};

// 엔터프라이즈를 제외한 일반 플랜
const REGULAR_PLAN_IDS = (
  Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlanId[]
).filter((key) => !SUBSCRIPTION_PLANS[key].contactOnly);

// 준비중인 플랜
const COMING_SOON_PLANS: SubscriptionPlanId[] = ['PRO'];

export const PlansTab = ({
  currentPlanId,
  isPaidPlanDisabled,
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
          const isComingSoon = COMING_SOON_PLANS.includes(planId);
          const isDisabled = isPaidPlanDisabled && isPaidPlan;

          return (
            <PlanCard
              key={planId}
              planId={planId}
              isYearly={isYearly}
              isCurrentPlan={isCurrentPlan}
              isComingSoon={isComingSoon || isDisabled}
              showActionButton={!isCurrentPlan}
              onAction={() => onOpenModal(planId, isYearly)}
            />
          );
        })}
      </div>

      {/* 엔터프라이즈 플랜 */}
      <EnterprisePlanCard variant="dashed" />
    </div>
  );
};
