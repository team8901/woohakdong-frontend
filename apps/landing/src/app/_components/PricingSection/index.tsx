import { SUBSCRIPTION_PLANS } from '@/app/_helpers/constants/pricing';
import { Badge } from '@workspace/ui/components/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Check } from 'lucide-react';

export const PricingSection = () => {
  return (
    <section id="pricing" className="bg-background py-20 md:py-24">
      <div className="font-pretendard container mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-foreground mb-4 text-2xl font-bold md:text-4xl">합리적인 요금제</h2>
          <p className="text-muted-foreground text-lg">동아리 규모에 맞는 플랜을 선택하세요</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${plan.recommended ? 'border-primary border-2' : ''}`}>
              {plan.recommended && (
                <Badge className="bg-primary absolute -top-3 left-1/2 -translate-x-1/2">
                  추천
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6 text-center">
                  <span className="text-foreground text-3xl font-bold">
                    {plan.basePrice === 0 ? '무료' : `${plan.basePrice.toLocaleString()}원`}
                  </span>
                  {plan.basePrice > 0 && <span className="text-muted-foreground">/월</span>}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="text-primary size-4 shrink-0" />
                      <span className="text-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-muted-foreground mt-8 text-center text-sm">
          동아리 생성 후 대시보드에서 플랜을 선택할 수 있습니다.
        </p>
      </div>
    </section>
  );
};
