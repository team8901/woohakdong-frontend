'use client';

import { useState } from 'react';

import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '@/app/payment/_helpers/constants/plans';
import { useSubscription } from '@/app/payment/_helpers/hooks/useSubscription';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { AlertCircle, Check, CreditCard } from 'lucide-react';
import Link from 'next/link';

const isMockMode = process.env.NEXT_PUBLIC_IS_MOCK === 'true';

type BillingClientProps = {
  clubId: number;
  clubEnglishName: string;
};

export const BillingClient = ({ clubId, clubEnglishName }: BillingClientProps) => {
  const { subscription, isLoading, error } = useSubscription({ clubId });
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId | null>(null);

  // 구독이 없으면 Free 플랜으로 간주
  const currentPlanId: SubscriptionPlanId = subscription?.planId
    ? (subscription.planId.toUpperCase() as SubscriptionPlanId)
    : 'FREE';
  const currentPlan = SUBSCRIPTION_PLANS[currentPlanId];

  const isPaidPlanDisabled = !isMockMode;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <CardContent className="flex items-start gap-3 py-4">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">오류 발생</p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5" />
                현재 구독
              </CardTitle>
              <CardDescription className="mt-1">
                {currentPlan.name} 플랜을 이용 중입니다.
              </CardDescription>
            </div>
            <Badge variant="default">활성</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">플랜</span>
              <span className="font-medium">{currentPlan.name}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">월 결제 금액</span>
              <span className="font-medium">
                {currentPlan.basePrice === 0
                  ? '무료'
                  : `${currentPlan.basePrice.toLocaleString()}원`}
              </span>
            </div>
            {subscription?.endDate && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">다음 결제일</span>
                  <span className="font-medium">
                    {new Date(subscription.endDate.seconds * 1000).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-foreground mb-4 text-lg font-semibold">플랜 변경</h2>
        {isPaidPlanDisabled && (
          <Card className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
            <CardContent className="flex items-start gap-3 py-4">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  유료 플랜 결제 준비 중
                </p>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  현재 유료 플랜 결제 기능을 준비하고 있습니다. 빠른 시일 내에 제공될 예정입니다.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          {(
            Object.entries(SUBSCRIPTION_PLANS) as [
              SubscriptionPlanId,
              (typeof SUBSCRIPTION_PLANS)[SubscriptionPlanId],
            ][]
          ).map(([key, plan]) => {
            const isCurrentPlan = currentPlanId === key;
            const isPaidPlan = plan.basePrice > 0;
            const isDisabled = isPaidPlanDisabled && isPaidPlan;
            const isSelected = selectedPlan === key;

            return (
              <Card
                key={key}
                className={`relative cursor-pointer transition-all ${
                  isSelected && !isDisabled
                    ? 'border-primary ring-primary/20 border-2 ring-2'
                    : isCurrentPlan
                      ? 'border-primary/50 border-2'
                      : 'hover:border-primary/50'
                } ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
                onClick={() => !isDisabled && !isCurrentPlan && setSelectedPlan(key)}>
                {plan.recommended && (
                  <Badge className="bg-primary absolute -top-3 left-1/2 -translate-x-1/2">
                    추천
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge
                    variant="outline"
                    className="absolute -top-3 right-4 border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                    현재 플랜
                  </Badge>
                )}
                {isDisabled && !isCurrentPlan && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-3 right-4 bg-blue-100 text-blue-700">
                    준비 중
                  </Badge>
                )}
                <CardHeader className="pb-2 text-center">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 text-center">
                    <span className="text-foreground text-2xl font-bold">
                      {plan.basePrice === 0 ? '무료' : `${plan.basePrice.toLocaleString()}원`}
                    </span>
                    {plan.basePrice > 0 && (
                      <span className="text-muted-foreground text-sm">/월</span>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="text-primary size-3 shrink-0" />
                        <span className="text-foreground text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedPlan && selectedPlan !== currentPlanId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">플랜 변경</CardTitle>
            <CardDescription>
              {SUBSCRIPTION_PLANS[selectedPlan].name} 플랜으로 변경합니다.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link
                href={`${APP_PATH.PAYMENT.HOME}?plan=${selectedPlan.toLowerCase()}&clubId=${clubId}&clubEnglishName=${clubEnglishName}`}>
                {SUBSCRIPTION_PLANS[selectedPlan].basePrice === 0
                  ? '무료 플랜으로 변경'
                  : `${SUBSCRIPTION_PLANS[selectedPlan].basePrice.toLocaleString()}원 결제하기`}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      {isMockMode && (
        <Badge variant="outline" className="w-fit">
          Mock 환경
        </Badge>
      )}
    </div>
  );
};
