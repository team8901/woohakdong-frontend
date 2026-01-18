import { EnterprisePlanCard } from '@workspace/ui/components/plan-card';

import { PricingCardsClient } from '../../_clientBoundary/PricingCardsClient';

export const PricingSection = () => {
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
          <PricingCardsClient />
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
