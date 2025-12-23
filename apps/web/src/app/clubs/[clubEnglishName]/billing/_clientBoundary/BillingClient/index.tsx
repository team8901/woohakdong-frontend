'use client';

import { useEffect, useState } from 'react';

import {
  BILLING_PAYMENT_METHODS,
  DEFAULT_BILLING_CHANNEL,
  type PaymentMethodId,
  PORTONE_STORE_ID,
} from '@/app/payment/_helpers/constants/portone';
import { useSubscription } from '@/app/payment/_helpers/hooks/useSubscription';
import { useGetMyProfile } from '@workspace/api';
import { getCurrentUser } from '@workspace/firebase/auth';
import {
  cancelSubscription,
  createFreeSubscription,
  createMockSubscription,
  createSubscriptionWithBillingKey,
  deleteBillingKey,
  saveBillingKey,
} from '@workspace/firebase/subscription';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Dialog, DialogContent } from '@workspace/ui/components/dialog';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '@workspace/ui/constants/plans';
import { AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import {
  ConfirmStep,
  ErrorStep,
  ProcessingStep,
  SelectCardStep,
  SuccessStep,
} from '../../_components/BillingModal';
import { CancelSubscriptionModal } from '../../_components/CancelSubscriptionModal';
import { OverviewTab } from '../../_components/OverviewTab';
import { PaymentHistoryTab } from '../../_components/PaymentHistoryTab';
import { PaymentMethodsTab } from '../../_components/PaymentMethodsTab';
import { PlansTab } from '../../_components/PlansTab';

type BillingClientProps = {
  clubId: number;
};

type ModalStep = 'select-card' | 'confirm' | 'processing' | 'success' | 'error';

export const BillingClient = ({ clubId }: BillingClientProps) => {
  const {
    subscription,
    paymentHistory,
    defaultBillingKey,
    isLoading,
    error,
    refetch,
  } = useSubscription({ clubId });
  const { data: myProfile } = useGetMyProfile();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('select-card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isYearlyBilling, setIsYearlyBilling] = useState(false);

  useEffect(() => {
    setIsMockMode(process.env.NEXT_PUBLIC_IS_MOCK === 'true');
  }, []);

  const currentPlanId: SubscriptionPlanId = subscription?.planId
    ? (subscription.planId.toUpperCase() as SubscriptionPlanId)
    : 'FREE';

  const isPortoneEnabled = !!PORTONE_STORE_ID;
  const isPaidPlanDisabled = !isMockMode && !isPortoneEnabled;

  const handleOpenModal = (plan: SubscriptionPlanId, isYearly = false) => {
    setSelectedPlan(plan);
    setIsYearlyBilling(isYearly);

    const targetPlan = SUBSCRIPTION_PLANS[plan];
    const isFreeDowngrade = targetPlan.monthlyPrice === 0;

    setModalStep(
      isFreeDowngrade
        ? 'confirm'
        : defaultBillingKey
          ? 'confirm'
          : 'select-card',
    );
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
    setModalStep('select-card');
    setErrorMessage(null);
  };

  const handleDeleteCard = async () => {
    if (!defaultBillingKey) return;

    setIsDeleting(true);

    try {
      await deleteBillingKey(defaultBillingKey.id);
      await refetch();
    } catch (err) {
      console.error('Failed to delete card:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    setIsCanceling(true);

    try {
      await cancelSubscription(subscription.id);
      await refetch();
      setIsCancelModalOpen(false);
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
    } finally {
      setIsCanceling(false);
    }
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
        cardCompany: '모의 결제수단',
        cardNumber: '',
      });

      await refetch();
      setModalStep('confirm');
    } catch (err) {
      console.error('Failed to register mock payment method:', err);
      setErrorMessage('결제수단 등록 중 오류가 발생했습니다.');
      setModalStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegisterRealCard = async (methodId?: PaymentMethodId) => {
    setIsProcessing(true);
    setModalStep('processing');

    try {
      const user = getCurrentUser();

      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const portoneModule = await import('@portone/browser-sdk/v2');
      const PortOne = portoneModule.default ?? portoneModule;

      if (!PORTONE_STORE_ID) {
        setErrorMessage('결제 시스템 설정이 완료되지 않았습니다.');
        setModalStep('error');

        return;
      }

      const billingKeyId = `billing_${clubId}_${Date.now()}_${uuidv4().slice(0, 8)}`;
      const methodInfo = BILLING_PAYMENT_METHODS.find((m) => m.id === methodId);
      const channelKey = methodInfo?.channelKey ?? DEFAULT_BILLING_CHANNEL;
      const billingKeyMethod = methodInfo?.billingKeyMethod ?? 'CARD';

      const requestParams = {
        storeId: PORTONE_STORE_ID,
        channelKey,
        billingKeyMethod,
        issueId: billingKeyId,
        issueName: '정기결제 등록',
        customer: {
          customerId: user.uid,
          fullName: myProfile?.nickname ?? user.displayName ?? undefined,
          email: myProfile?.email ?? user.email ?? undefined,
          phoneNumber: myProfile?.phoneNumber ?? undefined,
        },
      };

      console.log('[PortOne] requestIssueBillingKey params:', requestParams);

      const response = await PortOne.requestIssueBillingKey(requestParams);

      console.log('[PortOne] requestIssueBillingKey response:', response);

      if (!response) {
        throw new Error('빌링키 발급 응답이 없습니다.');
      }

      if (response.code) {
        if (response.code === 'USER_CANCEL') {
          setModalStep('select-card');

          return;
        }

        throw new Error(response.message ?? '빌링키 발급에 실패했습니다.');
      }

      if (!response.billingKey) {
        throw new Error('빌링키가 발급되지 않았습니다.');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseAny = response as any;

      await saveBillingKey({
        clubId,
        userId: user.uid,
        userEmail: user.email ?? '',
        billingKey: response.billingKey,
        customerKey: billingKeyId,
        cardCompany: responseAny.card?.name ?? methodInfo?.label ?? '카드',
        cardNumber: responseAny.card?.number ?? '',
      });

      await refetch();
      setModalStep('confirm');
    } catch (err) {
      console.error('Failed to register payment method:', err);

      if (err instanceof Error && err.message.includes('cancel')) {
        setModalStep('select-card');

        return;
      }

      setErrorMessage(
        err instanceof Error
          ? err.message
          : '결제수단 등록창을 열 수 없습니다.',
      );
      setModalStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    setModalStep('processing');

    try {
      const user = getCurrentUser();

      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const plan = SUBSCRIPTION_PLANS[selectedPlan];
      const billingPrice = isYearlyBilling
        ? plan.yearlyPrice * 12
        : plan.monthlyPrice;
      const billingCycle = isYearlyBilling ? '연간' : '월간';

      if (plan.monthlyPrice === 0) {
        await createFreeSubscription({
          clubId,
          userId: user.uid,
          userEmail: user.email ?? '',
          planId: plan.id,
          planName: plan.name,
        });

        await refetch();
        setModalStep('success');

        return;
      }

      if (!defaultBillingKey) {
        setModalStep('select-card');

        return;
      }

      if (isMockMode) {
        await createMockSubscription(
          {
            clubId,
            userId: user.uid,
            userEmail: user.email ?? '',
            planId: plan.id,
            planName: plan.name,
            price: billingPrice,
          },
          defaultBillingKey.id,
        );
      } else {
        const paymentId = `payment_${clubId}_${Date.now()}_${uuidv4().slice(0, 8)}`;

        const paymentResponse = await fetch('/api/portone/billing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            billingKey: defaultBillingKey.billingKey,
            paymentId,
            orderName: `${plan.name} 플랜 ${billingCycle} 구독`,
            amount: billingPrice,
            customer: {
              id: user.uid,
              name: user.displayName,
              email: user.email,
            },
          }),
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();

          throw new Error(errorData.message ?? '결제에 실패했습니다.');
        }

        const { transactionId } = await paymentResponse.json();

        await createSubscriptionWithBillingKey({
          clubId,
          userId: user.uid,
          userEmail: user.email ?? '',
          planId: plan.id,
          planName: plan.name,
          price: billingPrice,
          billingKeyId: defaultBillingKey.id,
          orderId: paymentId,
          transactionId: transactionId ?? paymentId,
        });
      }

      await refetch();
      setModalStep('success');
    } catch (err) {
      console.error('Failed to process payment:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : '결제 처리 중 오류가 발생했습니다.',
      );
      setModalStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4 py-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
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
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">오버뷰</TabsTrigger>
          <TabsTrigger value="payment-methods">결제수단</TabsTrigger>
          <TabsTrigger value="payment-history">결제내역</TabsTrigger>
          <TabsTrigger value="plans">요금제</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab
            subscription={subscription}
            currentPlanId={currentPlanId}
            onCancelSubscription={() => setIsCancelModalOpen(true)}
          />
        </TabsContent>

        <TabsContent value="payment-methods">
          <PaymentMethodsTab
            defaultBillingKey={defaultBillingKey}
            isPaidPlanDisabled={isPaidPlanDisabled}
            isProcessing={isProcessing}
            isDeleting={isDeleting}
            onRegisterCard={handleRegisterRealCard}
            onDeleteCard={handleDeleteCard}
          />
        </TabsContent>

        <TabsContent value="payment-history">
          <PaymentHistoryTab paymentHistory={paymentHistory} />
        </TabsContent>

        <TabsContent value="plans">
          <PlansTab
            currentPlanId={currentPlanId}
            isPaidPlanDisabled={isPaidPlanDisabled}
            onOpenModal={handleOpenModal}
          />
        </TabsContent>
      </Tabs>

      {/* 플랜 변경 모달 */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          {modalStep === 'select-card' && (
            <SelectCardStep
              isMockMode={isMockMode}
              isProcessing={isProcessing}
              onRegisterPaymentMethod={handleRegisterRealCard}
              onRegisterMockCard={handleRegisterMockCard}
              onClose={handleCloseModal}
            />
          )}

          {modalStep === 'confirm' && selectedPlan && (
            <ConfirmStep
              selectedPlan={selectedPlan}
              isYearly={isYearlyBilling}
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

      {/* 구독 취소 확인 모달 */}
      <CancelSubscriptionModal
        isOpen={isCancelModalOpen}
        isProcessing={isCanceling}
        onConfirm={handleCancelSubscription}
        onClose={() => setIsCancelModalOpen(false)}
      />

      {isMockMode && (
        <Badge variant="outline" className="w-fit">
          Mock 환경
        </Badge>
      )}
    </div>
  );
};
