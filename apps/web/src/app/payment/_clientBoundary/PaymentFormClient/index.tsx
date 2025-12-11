'use client';

import { useEffect, useState } from 'react';

import { getCurrentUser, signInWithGoogle } from '@workspace/firebase/auth';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '../../_helpers/constants/plans';
import { usePaymentWidget } from '../../_helpers/hooks/usePaymentWidget';
import { PlanCardClient } from '../PlanCardClient';

type PaymentFormClientProps = {
  initialPlan?: SubscriptionPlanId;
  clubId: number;
  clubEnglishName: string;
};

// TODO: [사업자등록 후] 토스페이먼츠 키 발급 후 isMockMode 조건 제거
const isMockMode = process.env.NEXT_PUBLIC_IS_MOCK === 'true';

export const PaymentFormClient = ({
  initialPlan = 'STANDARD',
  clubId,
  clubEnglishName,
}: PaymentFormClientProps) => {
  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionPlanId>(initialPlan);
  const [customerKey] = useState(() => uuidv4());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { renderPaymentMethods, requestPayment, isReady } =
    usePaymentWidget(customerKey);

  const plan = SUBSCRIPTION_PLANS[selectedPlan];
  const isPaidPlan = plan.basePrice > 0;
  // Mock 환경에서만 결제 플로우 테스트 가능, 그 외 환경은 "준비 중"
  const isPaymentDisabled = !isMockMode && isPaidPlan;

  useEffect(() => {
    const user = getCurrentUser();

    setIsLoggedIn(!!user);
  }, []);

  useEffect(() => {
    if (isReady && isPaidPlan && isLoggedIn && !isPaymentDisabled) {
      renderPaymentMethods('#payment-methods', {
        value: plan.basePrice,
        currency: 'KRW',
      });
    }
  }, [
    isReady,
    selectedPlan,
    renderPaymentMethods,
    isPaidPlan,
    isLoggedIn,
    plan.basePrice,
    isPaymentDisabled,
  ]);

  const handleLogin = async () => {
    setIsLoggingIn(true);

    try {
      await signInWithGoogle();
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFreeStart = () => {
    window.location.href = '/club-list';
  };

  const handlePayment = async () => {
    if (!isLoggedIn) {
      await handleLogin();

      return;
    }

    const orderId = `ORDER_${Date.now()}_${uuidv4().slice(0, 8)}`;

    const successParams = new URLSearchParams({
      plan: plan.id,
      planName: plan.name,
      clubId: String(clubId),
      clubEnglishName,
    });

    try {
      await requestPayment({
        orderId,
        orderName: `우학동 ${plan.name} 플랜 구독`,
        successUrl: `${window.location.origin}/payment/success?${successParams.toString()}`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error) {
      console.error('Payment request failed:', error);
    }
  };

  const handleMockPayment = async () => {
    if (!isLoggedIn) {
      await handleLogin();

      return;
    }

    // Mock 결제: 실제 토스페이먼츠 호출 없이 success 페이지로 이동
    const orderId = `MOCK_ORDER_${Date.now()}_${uuidv4().slice(0, 8)}`;
    const paymentKey = `MOCK_PAYMENT_KEY_${uuidv4()}`;

    const successParams = new URLSearchParams({
      orderId,
      paymentKey,
      amount: String(plan.basePrice),
      plan: plan.id,
      planName: plan.name,
      clubId: String(clubId),
      clubEnglishName,
    });

    window.location.href = `/payment/success?${successParams.toString()}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-foreground mb-4 text-lg font-semibold">
          플랜 선택
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(
            Object.entries(SUBSCRIPTION_PLANS) as [
              SubscriptionPlanId,
              typeof plan,
            ][]
          ).map(([key, planData]) => (
            <PlanCardClient
              key={key}
              plan={planData}
              isSelected={selectedPlan === key}
              onSelect={() => setSelectedPlan(key)}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">결제 금액</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {plan.name} 플랜 기본금
            </span>
            <span className="font-medium">
              {plan.basePrice.toLocaleString()}원
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-lg font-semibold">총 결제 금액</span>
            <span className="text-primary text-lg font-bold">
              {plan.basePrice.toLocaleString()}원
            </span>
          </div>
        </CardContent>
      </Card>

      {isPaymentDisabled && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">
                유료 플랜 결제 준비 중
              </p>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                현재 유료 플랜 결제 기능을 준비하고 있습니다. 빠른 시일 내에
                제공될 예정이니 조금만 기다려주세요.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isPaidPlan && !isLoggedIn && !isPaymentDisabled && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="py-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              유료 플랜 결제를 위해 먼저 로그인이 필요합니다.
            </p>
          </CardContent>
        </Card>
      )}

      {isPaidPlan && isLoggedIn && !isPaymentDisabled && !isMockMode && (
        <div>
          <h2 className="text-foreground mb-4 text-lg font-semibold">
            결제 수단
          </h2>
          <div id="payment-methods" className="min-h-[300px]" />
        </div>
      )}

      {isMockMode && (
        <Badge variant="outline" className="w-fit">
          Mock 환경
        </Badge>
      )}

      {isPaidPlan ? (
        isPaymentDisabled ? (
          <Button className="w-full" size="lg" disabled>
            결제 준비 중
          </Button>
        ) : isMockMode ? (
          <Button
            onClick={isLoggedIn ? handleMockPayment : handleLogin}
            className="w-full"
            size="lg"
            disabled={isLoggingIn}>
            {isLoggingIn
              ? '로그인 중...'
              : isLoggedIn
                ? `${plan.basePrice.toLocaleString()}원 결제하기 (Mock)`
                : '로그인하고 결제하기'}
          </Button>
        ) : (
          <Button
            onClick={isLoggedIn ? handlePayment : handleLogin}
            className="w-full"
            size="lg"
            disabled={isLoggingIn || (isLoggedIn && !isReady)}>
            {isLoggingIn
              ? '로그인 중...'
              : isLoggedIn
                ? `${plan.basePrice.toLocaleString()}원 결제하기`
                : '로그인하고 결제하기'}
          </Button>
        )
      ) : (
        <Button onClick={handleFreeStart} className="w-full" size="lg">
          바로 서비스 이용하기
        </Button>
      )}
    </div>
  );
};
