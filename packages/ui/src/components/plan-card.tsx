'use client';

import type { ReactNode } from 'react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { EXTERNAL_LINKS } from '@workspace/ui/constants/links';
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '@workspace/ui/constants/plans';
import { Check, Clock, Mail, Sparkles } from 'lucide-react';

type PlanCardProps = {
  planId: SubscriptionPlanId;
  isYearly?: boolean;
  isCurrentPlan?: boolean;
  isComingSoon?: boolean;
  /** 만료 후 이 플랜으로 전환 예정 */
  isPendingPlan?: boolean;
  /** 구독이 취소되어 재구독 가능한 상태 */
  canReactivate?: boolean;
  /** 버튼 텍스트 커스텀 */
  actionLabel?: string;
  showActionButton?: boolean;
  actionButton?: ReactNode;
  onAction?: () => void;
};

export const PlanCard = ({
  planId,
  isYearly = false,
  isCurrentPlan = false,
  isComingSoon: isComingSoonProp,
  isPendingPlan = false,
  canReactivate = false,
  actionLabel,
  showActionButton = false,
  actionButton,
  onAction,
}: PlanCardProps) => {
  const plan = SUBSCRIPTION_PLANS[planId];
  const isComingSoon = isComingSoonProp ?? plan.comingSoon;

  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  const showDiscount =
    isYearly && plan.monthlyPrice > 0 && plan.yearlyPrice < plan.monthlyPrice;
  const discountPercent = showDiscount
    ? Math.round(
        ((plan.monthlyPrice - plan.yearlyPrice) / plan.monthlyPrice) * 100,
      )
    : 0;

  // Standard는 "인기", 나머지 recommended는 기본 배지
  const showRecommendedBadge = plan.recommended && !isComingSoon;

  return (
    <Card
      className={`relative flex flex-col transition-all ${
        isCurrentPlan || isPendingPlan
          ? 'border-primary/50 border-2'
          : plan.recommended && !isComingSoon
            ? 'border-primary ring-primary/20 border-2 ring-2'
            : isComingSoon
              ? 'opacity-60'
              : 'hover:border-primary/50 hover:shadow-lg'
      }`}>
      {showRecommendedBadge && (
        <Badge className="bg-primary absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1">
          <Sparkles className="size-3" />
          인기
        </Badge>
      )}
      {isComingSoon && (
        <Badge
          variant="secondary"
          className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 bg-blue-100 text-blue-700">
          <Clock className="size-3" />
          준비중
        </Badge>
      )}
      {isCurrentPlan && !isPendingPlan && (
        <Badge
          variant="outline"
          className="absolute -top-3 right-4 border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
          현재 플랜
        </Badge>
      )}
      {isPendingPlan && (
        <Badge
          variant="outline"
          className="absolute -top-3 right-4 border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
          전환 예정
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
            <span className="text-foreground text-4xl font-bold">무료</span>
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
              <span className="text-foreground text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        {showActionButton && (
          <div className="mt-6">
            {actionButton ?? (
              <Button
                className="w-full"
                disabled={
                  (isCurrentPlan && !canReactivate) ||
                  isComingSoon ||
                  isPendingPlan
                }
                onClick={onAction}>
                {actionLabel ??
                  (isComingSoon
                    ? '준비중'
                    : isPendingPlan
                      ? '전환 예정'
                      : canReactivate
                        ? '재구독'
                        : plan.monthlyPrice === 0
                          ? '무료로 시작'
                          : '플랜 변경')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

type EnterprisePlanCardProps = {
  variant?: 'default' | 'dashed';
};

export const EnterprisePlanCard = ({
  variant = 'default',
}: EnterprisePlanCardProps) => {
  const enterprisePlan = SUBSCRIPTION_PLANS.ENTERPRISE;

  return (
    <Card
      className={`transition-all ${variant === 'dashed' ? 'border-dashed' : 'hover:border-primary/50 hover:shadow-lg'}`}>
      <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <CardTitle className="text-xl">{enterprisePlan.name}</CardTitle>
          <CardDescription className="mt-1">
            {enterprisePlan.description}
          </CardDescription>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {enterprisePlan.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <Check className="text-primary size-4 shrink-0" />
                <span className="text-foreground text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-2 md:items-end">
          {variant === 'default' && (
            <span className="text-foreground text-xl font-bold">맞춤 견적</span>
          )}
          <Button variant="outline" asChild>
            <a href={`mailto:${EXTERNAL_LINKS.SUPPORT_EMAIL}`}>
              <Mail className="mr-1.5 size-4" />
              {variant === 'dashed' ? '도입 문의' : '문의하기'}
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
};

type BillingCycleToggleProps = {
  isYearly: boolean;
  onChange: (isYearly: boolean) => void;
};

export const BillingCycleToggle = ({
  isYearly,
  onChange,
}: BillingCycleToggleProps) => {
  return (
    <div className="bg-muted inline-flex items-center gap-3 rounded-full p-1">
      <button
        onClick={() => onChange(false)}
        className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          !isYearly
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}>
        월간 결제
      </button>
      <button
        onClick={() => onChange(true)}
        className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          isYearly
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}>
        연간 결제
        <span className="text-primary ml-1.5 text-xs font-semibold">할인</span>
      </button>
    </div>
  );
};
