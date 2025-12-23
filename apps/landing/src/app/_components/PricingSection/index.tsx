'use client';

import { useState } from 'react';

import { SUPPORT_MAIL } from '@/app/_helpers/constants/service';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { SUBSCRIPTION_PLANS } from '@workspace/ui/constants/plans';
import { Check, Clock, Mail, Sparkles } from 'lucide-react';

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
          <div className="bg-muted mt-6 inline-flex items-center gap-3 rounded-full p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !isYearly
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
              월간 결제
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isYearly
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
              연간 결제
              <span className="text-primary ml-1.5 text-xs font-semibold">
                할인
              </span>
            </button>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {Object.values(SUBSCRIPTION_PLANS)
            .filter((plan) => !plan.contactOnly)
            .map((plan) => {
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const showDiscount =
                isYearly &&
                plan.monthlyPrice > 0 &&
                plan.yearlyPrice < plan.monthlyPrice;
              const discountPercent = showDiscount
                ? Math.round(
                    ((plan.monthlyPrice - plan.yearlyPrice) /
                      plan.monthlyPrice) *
                      100,
                  )
                : 0;

              return (
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
                  {plan.comingSoon && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1">
                      <Clock className="size-3" />
                      준비중
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
                      {price === 0 ? (
                        <span className="text-foreground text-4xl font-bold">
                          무료
                        </span>
                      ) : (
                        <>
                          {showDiscount && (
                            <p className="text-muted-foreground mb-1 text-sm line-through">
                              {(plan.monthlyPrice * 12).toLocaleString()}원
                            </p>
                          )}
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-foreground text-4xl font-bold">
                              {isYearly
                                ? (price * 12).toLocaleString()
                                : price.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground text-lg">
                              원/{isYearly ? '연' : '월'}
                            </span>
                          </div>
                          {showDiscount && (
                            <p className="text-primary mt-1 text-xs font-medium">
                              {discountPercent}% 할인
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <ul className="flex-1 space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="text-primary mt-0.5 size-4 shrink-0" />
                          <span className="text-foreground text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
        </div>
        <Card className="hover:border-primary/50 mt-6 transition-all hover:shadow-lg">
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">
                {SUBSCRIPTION_PLANS.ENTERPRISE.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {SUBSCRIPTION_PLANS.ENTERPRISE.description}
              </CardDescription>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                {SUBSCRIPTION_PLANS.ENTERPRISE.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="text-primary size-4 shrink-0" />
                    <span className="text-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-center gap-2 md:items-end">
              <span className="text-foreground text-xl font-bold">
                맞춤 견적
              </span>
              <Button variant="outline" asChild>
                <a href={`mailto:${SUPPORT_MAIL}`}>
                  <Mail className="mr-1.5 size-4" />
                  문의하기
                </a>
              </Button>
            </div>
          </div>
        </Card>
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
