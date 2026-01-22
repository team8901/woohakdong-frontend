import { ServerErrorFallback } from '@/_shared/components/ServerErrorFallback';
import { ServiceFooter } from '@/_shared/components/ServiceFooter';
import { getClubIdByEnglishName } from '@/_shared/helpers/utils/getClubIdByEnglishName';
import { type Metadata } from 'next';

import { BillingClient } from './_clientBoundary/BillingClient';

export const metadata: Metadata = {
  title: '결제 관리 | 우학동',
  description: '구독 정보를 확인하고 플랜을 변경하세요.',
};

type BillingPageProps = {
  params: Promise<{ clubEnglishName: string }>;
};

const BillingPage = async ({ params }: BillingPageProps) => {
  const { clubEnglishName } = await params;
  const clubId = await getClubIdByEnglishName(clubEnglishName);

  if (clubId === null) {
    return <ServerErrorFallback message="동아리 정보를 찾을 수 없어요." />;
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 space-y-6">
        <div className="hidden flex-col md:flex">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            결제 관리
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            구독 정보를 확인하고 플랜을 변경할 수 있습니다.
          </p>
        </div>
        <BillingClient clubId={clubId} />
      </div>
      <ServiceFooter />
    </div>
  );
};

export default BillingPage;
