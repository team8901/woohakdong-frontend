import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '@workspace/ui/constants/plans';
import { type Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PaymentFormClient } from './_clientBoundary/PaymentFormClient';

export const metadata: Metadata = {
  title: '구독 결제 | 우학동',
  description: '우학동 구독 플랜을 선택하고 결제하세요.',
};

type PaymentPageProps = {
  searchParams: Promise<{
    plan?: string;
    clubId?: string;
    clubEnglishName?: string;
  }>;
};

const PaymentPage = async ({ searchParams }: PaymentPageProps) => {
  const params = await searchParams;
  const planParam = params.plan?.toUpperCase() as
    | SubscriptionPlanId
    | undefined;
  const initialPlan: SubscriptionPlanId =
    planParam && planParam in SUBSCRIPTION_PLANS ? planParam : 'STANDARD';

  const clubId = params.clubId ? Number(params.clubId) : null;
  const clubEnglishName = params.clubEnglishName ?? null;

  // clubId가 없으면 결제 불가
  if (!clubId || !clubEnglishName) {
    redirect('/club-list');
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-foreground text-2xl font-bold">구독 결제</h1>
          <p className="text-muted-foreground mt-2">
            동아리에 맞는 플랜을 선택하고 결제하세요.
          </p>
        </div>
        <PaymentFormClient
          initialPlan={initialPlan}
          clubId={clubId}
          clubEnglishName={clubEnglishName}
        />
      </div>
    </div>
  );
};

export default PaymentPage;
