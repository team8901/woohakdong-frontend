import { type Metadata } from 'next';

import { PaymentSuccessClient } from './_clientBoundary/PaymentSuccessClient';

export const metadata: Metadata = {
  title: '결제 완료 | 우학동',
  description: '결제가 완료되었습니다.',
};

type PaymentSuccessPageProps = {
  searchParams: Promise<{
    orderId?: string;
    paymentKey?: string;
    amount?: string;
    plan?: string;
    planName?: string;
    clubId?: string;
    clubEnglishName?: string;
  }>;
};

const PaymentSuccessPage = async ({ searchParams }: PaymentSuccessPageProps) => {
  const params = await searchParams;

  return (
    <PaymentSuccessClient
      orderId={params.orderId}
      paymentKey={params.paymentKey}
      amount={params.amount}
      plan={params.plan}
      planName={params.planName}
      clubId={params.clubId ? Number(params.clubId) : undefined}
      clubEnglishName={params.clubEnglishName}
    />
  );
};

export default PaymentSuccessPage;
