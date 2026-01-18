'use client';

import { useState } from 'react';

import {
  BillingCycleToggle,
  PlanCard,
} from '@workspace/ui/components/plan-card';
import { SUBSCRIPTION_PLANS } from '@workspace/ui/constants/plans';

// 엔터프라이즈를 제외한 일반 플랜
const REGULAR_PLAN_IDS = (
  Object.keys(SUBSCRIPTION_PLANS) as (keyof typeof SUBSCRIPTION_PLANS)[]
).filter((key) => !SUBSCRIPTION_PLANS[key].contactOnly);

export const PricingCardsClient = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <>
      <div className="mt-6">
        <BillingCycleToggle isYearly={isYearly} onChange={setIsYearly} />
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {REGULAR_PLAN_IDS.map((planId) => (
          <PlanCard key={planId} planId={planId} isYearly={isYearly} />
        ))}
      </div>
    </>
  );
};
