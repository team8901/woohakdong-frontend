'use client';

import { useState } from 'react';

import {
  BillingCycleToggle,
  EnterprisePlanCard,
  PlanCard,
} from '@workspace/ui/components/plan-card';
import { SUBSCRIPTION_PLANS } from '@workspace/ui/constants/plans';

// 엔터프라이즈를 제외한 일반 플랜
const REGULAR_PLAN_IDS = (
  Object.keys(SUBSCRIPTION_PLANS) as (keyof typeof SUBSCRIPTION_PLANS)[]
).filter((key) => !SUBSCRIPTION_PLANS[key].contactOnly);

export const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="bg-background py-20 md:py-24">
      <div className="font-pretendard container mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-foreground mb-4 text-2xl font-bold md:text-4xl">
            합리적인 요금제
          </h2>
          <p className="text-muted-foreground text-lg">
            동아리 규모와 필요에 맞는 플랜을 선택하세요
          </p>
          <div className="mt-6">
            <BillingCycleToggle isYearly={isYearly} onChange={setIsYearly} />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {REGULAR_PLAN_IDS.map((planId) => (
            <PlanCard key={planId} planId={planId} isYearly={isYearly} />
          ))}
        </div>
        <div className="mt-6">
          <EnterprisePlanCard />
        </div>
        <div className="mt-10 text-center">
          <p className="text-muted-foreground text-sm">
            어떤 플랜이 맞는지 모르겠다면?{' '}
            <span className="text-primary font-medium">
              Free로 시작해보세요
            </span>
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            언제든지 플랜을 변경할 수 있습니다 · 숨겨진 비용 없음
          </p>
        </div>
      </div>
    </section>
  );
};
