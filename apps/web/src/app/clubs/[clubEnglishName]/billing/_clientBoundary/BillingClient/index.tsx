'use client';

import { useEffect, useState } from 'react';

import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '@/app/payment/_helpers/constants/plans';
import { useSubscription } from '@/app/payment/_helpers/hooks/useSubscription';
import { getCurrentUser } from '@workspace/firebase/auth';
import {
  createMockSubscription,
  createSubscriptionWithBillingKey,
  saveBillingKey,
} from '@workspace/firebase/subscription';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Dialog, DialogContent } from '@workspace/ui/components/dialog';
import { Separator } from '@workspace/ui/components/separator';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { AlertCircle, Check, CreditCard } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import {
  ConfirmStep,
  ErrorStep,
  ProcessingStep,
  SelectCardStep,
  SuccessStep,
} from '../../_components/BillingModal';

type BillingClientProps = {
  clubId: number;
  clubEnglishName: string;
};

type ModalStep =
  | 'select-card'
  | 'confirm'
  | 'processing'
  | 'success'
  | 'error';

export const BillingClient = ({
  clubId,
  clubEnglishName,
}: BillingClientProps) => {
  const { subscription, defaultBillingKey, isLoading, error, refetch } =
    useSubscription({ clubId });
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('select-card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    setIsMockMode(process.env.NEXT_PUBLIC_IS_MOCK === 'true');
  }, []);

  const currentPlanId: SubscriptionPlanId = subscription?.planId
    ? (subscription.planId.toUpperCase() as SubscriptionPlanId)
    : 'FREE';
  const currentPlan = SUBSCRIPTION_PLANS[currentPlanId];

  const isTossPaymentsEnabled =
    !!process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY;
  const isPaidPlanDisabled = !isMockMode && !isTossPaymentsEnabled;

  const handleOpenModal = (plan: SubscriptionPlanId) => {
    setSelectedPlan(plan);
    setModalStep(defaultBillingKey ? 'confirm' : 'select-card');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
    setModalStep('select-card');
    setErrorMessage(null);
  };

  const handleRegisterMockCard = async () => {
    setIsProcessing(true);
    setModalStep('processing');

    try {
      const user = getCurrentUser();

      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const mockBillingKey = `mock_billing_${uuidv4()}`;
      const mockCustomerKey = `customer_${clubId}_${uuidv4().slice(0, 8)}`;

      await saveBillingKey({
        clubId,
        userId: user.uid,
        userEmail: user.email ?? '',
        billingKey: mockBillingKey,
        customerKey: mockCustomerKey,
        cardCompany: '모의카드',
        cardNumber: '**** **** **** 1234',
      });

      await refetch();
      setModalStep('confirm');
    } catch (err) {
      console.error('Failed to register mock card:', err);
      setErrorMessage('카드 등록 중 오류가 발생했습니다.');
      setModalStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegisterRealCard = async () => {
    try {
      const { loadTossPayments } = await import('@tosspayments/payment-sdk');
      const clientKey = process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY ?? '';

      if (!clientKey) {
        setErrorMessage('결제 시스템 설정이 완료되지 않았습니다.');
        setModalStep('error');

        return;
      }

      const tossPayments = await loadTossPayments(clientKey);
      const customerKey = `customer_${clubId}_${uuidv4().slice(0, 8)}`;

      const successUrl = `${window.location.origin}/billing/card-register/success?clubId=${clubId}&clubEnglishName=${clubEnglishName}`;
      const failUrl = `${window.location.origin}/billing/card-register/fail?clubEnglishName=${clubEnglishName}`;

      await tossPayments.requestBillingAuth('카드', {
        customerKey,
        successUrl,
        failUrl,
      });
    } catch (err) {
      console.error('Failed to open card registration:', err);

      if (err instanceof Error && err.message.includes('USER_CANCEL')) {
        return;
      }

      setErrorMessage('카드 등록창을 열 수 없습니다.');
      setModalStep('error');
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan || !defaultBillingKey) return;

    setIsProcessing(true);
    setModalStep('processing');

    try {
      const user = getCurrentUser();

      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const plan = SUBSCRIPTION_PLANS[selectedPlan];

      if (isMockMode) {
        await createMockSubscription(
          {
            clubId,
            userId: user.uid,
            userEmail: user.email ?? '',
            planId: plan.id,
            planName: plan.name,
            price: plan.basePrice,
          },
          defaultBillingKey.id,
        );
      } else {
        const orderId = `order_${clubId}_${Date.now()}`;

        const paymentResponse = await fetch('/api/billing/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            billingKey: defaultBillingKey.billingKey,
            customerKey: defaultBillingKey.customerKey,
            amount: plan.basePrice,
            orderId,
            orderName: `${plan.name} 플랜 구독`,
          }),
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();

          throw new Error(errorData.message ?? '결제에 실패했습니다.');
        }

        const { paymentKey } = await paymentResponse.json();

        await createSubscriptionWithBillingKey({
          clubId,
          userId: user.uid,
          userEmail: user.email ?? '',
          planId: plan.id,
          planName: plan.name,
          price: plan.basePrice,
          billingKeyId: defaultBillingKey.id,
          orderId,
          paymentKey,
        });
      }

      await refetch();
      setModalStep('success');
    } catch (err) {
      console.error('Failed to process payment:', err);
      setErrorMessage('결제 처리 중 오류가 발생했습니다.');
      setModalStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

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
            <p className="font-medium text-red-800 dark:text-red-200">
              오류 발생
            </p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* 현재 구독 정보 */}
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
                    {new Date(
                      subscription.endDate.seconds * 1000,
                    ).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 등록된 카드 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">결제 수단</CardTitle>
          <CardDescription>
            정기 결제에 사용할 카드를 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {defaultBillingKey ? (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="text-muted-foreground size-8" />
                <div>
                  <p className="font-medium">{defaultBillingKey.cardCompany}</p>
                  <p className="text-muted-foreground text-sm">
                    {defaultBillingKey.cardNumber}
                  </p>
                </div>
              </div>
              <Badge variant="outline">기본 카드</Badge>
            </div>
          ) : (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
              <CreditCard className="mb-2 size-12 opacity-50" />
              <p>등록된 카드가 없습니다.</p>
              <p className="text-sm">유료 플랜 구독 시 카드를 등록해주세요.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 플랜 변경 */}
      <div>
        <h2 className="text-foreground mb-4 text-lg font-semibold">
          플랜 변경
        </h2>
        {isPaidPlanDisabled && (
          <Card className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
            <CardContent className="flex items-start gap-3 py-4">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  유료 플랜 결제 준비 중
                </p>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  현재 유료 플랜 결제 기능을 준비하고 있습니다. 빠른 시일 내에
                  제공될 예정입니다.
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
                onClick={() =>
                  !isDisabled && !isCurrentPlan && setSelectedPlan(key)
                }>
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
                  <CardDescription className="text-sm">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 text-center">
                    <span className="text-foreground text-2xl font-bold">
                      {plan.basePrice === 0
                        ? '무료'
                        : `${plan.basePrice.toLocaleString()}원`}
                    </span>
                    {plan.basePrice > 0 && (
                      <span className="text-muted-foreground text-sm">/월</span>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="text-primary size-3 shrink-0" />
                        <span className="text-foreground text-xs">
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
      </div>

      {/* 플랜 변경 버튼 */}
      {selectedPlan && selectedPlan !== currentPlanId && (
        <Button
          className="w-full"
          onClick={() => handleOpenModal(selectedPlan)}>
          {SUBSCRIPTION_PLANS[selectedPlan].name} 플랜으로 변경하기
        </Button>
      )}

      {/* 플랜 변경 모달 */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          {modalStep === 'select-card' && (
            <SelectCardStep
              isMockMode={isMockMode}
              isProcessing={isProcessing}
              onRegisterRealCard={handleRegisterRealCard}
              onRegisterMockCard={handleRegisterMockCard}
              onClose={handleCloseModal}
            />
          )}

          {modalStep === 'confirm' && selectedPlan && (
            <ConfirmStep
              selectedPlan={selectedPlan}
              defaultBillingKey={defaultBillingKey}
              onPayment={handlePayment}
              onSelectCard={() => setModalStep('select-card')}
              onClose={handleCloseModal}
            />
          )}

          {modalStep === 'processing' && <ProcessingStep />}

          {modalStep === 'success' && selectedPlan && (
            <SuccessStep
              selectedPlan={selectedPlan}
              onClose={handleCloseModal}
            />
          )}

          {modalStep === 'error' && (
            <ErrorStep
              errorMessage={errorMessage}
              onRetry={() => setModalStep('select-card')}
              onClose={handleCloseModal}
            />
          )}
        </DialogContent>
      </Dialog>

      {isMockMode && (
        <Badge variant="outline" className="w-fit">
          Mock 환경
        </Badge>
      )}
    </div>
  );
};
