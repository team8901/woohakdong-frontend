/**
 * 결제 폼 클라이언트 컴포넌트
 * 포트원을 사용한 일회성 결제
 * @see https://developers.portone.io/
 */
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
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '@workspace/ui/constants/plans';
import { AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { DEFAULT_BILLING_CHANNEL } from '../../_helpers/constants/portone';
import { usePortone } from '../../_helpers/hooks/usePortone';
import { PlanCardClient } from '../PlanCardClient';

type PaymentFormClientProps = {
  initialPlan?: SubscriptionPlanId;
  clubId: number;
  clubEnglishName: string;
};

const isMockMode = process.env.NEXT_PUBLIC_IS_MOCK === 'true';
const isPortoneEnabled = !!process.env.NEXT_PUBLIC_PORTONE_STORE_ID;

export const PaymentFormClient = ({
  initialPlan = 'STANDARD',
  clubId,
  clubEnglishName,
}: PaymentFormClientProps) => {
  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionPlanId>(initialPlan);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { requestPayment, isReady } = usePortone();

  const plan = SUBSCRIPTION_PLANS[selectedPlan];
  const isPaidPlan = plan.basePrice > 0;
  // Mock 환경이 아니고 포트원 설정이 없으면 결제 비활성화
  const isPaymentDisabled = !isMockMode && !isPortoneEnabled && isPaidPlan;

  useEffect(() => {
    const user = getCurrentUser();

    setIsLoggedIn(!!user);
  }, []);

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

    setIsProcessing(true);

    try {
      const user = getCurrentUser();
      const orderId = `ORDER_${Date.now()}_${uuidv4().slice(0, 8)}`;

      const result = await requestPayment({
        channelKey: DEFAULT_BILLING_CHANNEL,
        orderId,
        orderName: `우학동 ${plan.name} 플랜 구독`,
        amount: plan.basePrice,
        customer: user
          ? {
              customerId: user.uid,
              fullName: user.displayName ?? undefined,
              email: user.email ?? undefined,
            }
          : undefined,
      });

      // 결제 성공 시 success 페이지로 이동
      const successParams = new URLSearchParams({
        orderId: result.paymentId,
        transactionId: result.txId ?? '',
        amount: String(plan.basePrice),
        plan: plan.id,
        planName: plan.name,
        clubId: String(clubId),
        clubEnglishName,
      });

      window.location.href = `/payment/success?${successParams.toString()}`;
    } catch (error) {
      console.error('Payment request failed:', error);
      // 사용자 취소는 에러 메시지 표시하지 않음
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMockPayment = async () => {
    if (!isLoggedIn) {
      await handleLogin();

      return;
    }

    // Mock 결제: 실제 포트원 호출 없이 success 페이지로 이동
    const orderId = `MOCK_ORDER_${Date.now()}_${uuidv4().slice(0, 8)}`;
    const transactionId = `MOCK_TX_${uuidv4()}`;

    const successParams = new URLSearchParams({
      orderId,
      transactionId,
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
            disabled={isLoggingIn || isProcessing || (isLoggedIn && !isReady)}>
            {isLoggingIn
              ? '로그인 중...'
              : isProcessing
                ? '결제 처리 중...'
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
