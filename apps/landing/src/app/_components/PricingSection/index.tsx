import { Badge } from '@workspace/ui/components/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { SUBSCRIPTION_PLANS } from '@workspace/ui/constants/plans';
import { Check, Sparkles } from 'lucide-react';

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
          <p className="text-muted-foreground mt-2 text-sm">
            모든 유료 플랜은 7일 무료 체험 가능
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col transition-all hover:shadow-lg ${
                plan.recommended
                  ? 'border-primary ring-primary/20 border-2 ring-2'
                  : 'hover:border-primary/50'
              }`}>
              {plan.recommended && (
                <Badge className="bg-primary absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1">
                  <Sparkles className="size-3" />
                  인기
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[40px]">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <div className="mb-6 text-center">
                  {plan.basePrice === 0 ? (
                    <span className="text-foreground text-4xl font-bold">
                      무료
                    </span>
                  ) : (
                    <>
                      <span className="text-foreground text-4xl font-bold">
                        {plan.basePrice.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground text-lg">
                        원/월
                      </span>
                    </>
                  )}
                  {plan.basePrice > 0 && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      연 결제 시 2개월 무료
                    </p>
                  )}
                </div>
                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="text-primary mt-0.5 size-4 shrink-0" />
                      <span className="text-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
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
