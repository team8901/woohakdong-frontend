import { PlanCard } from '@workspace/ui/components/plan-card';
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '@workspace/ui/constants/plans';

// 모든 플랜 (FREE, STANDARD, ENTERPRISE)
const ALL_PLAN_IDS = Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlanId[];

export const PricingCards = () => {
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-3">
      {ALL_PLAN_IDS.map((planId) => (
        <PlanCard key={planId} planId={planId} />
      ))}
    </div>
  );
};
