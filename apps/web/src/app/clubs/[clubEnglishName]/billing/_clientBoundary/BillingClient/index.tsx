'use client';

import { useEffect, useState } from 'react';

import { showToast } from '@/_shared/helpers/utils/showToast';
import { useGetMyProfile } from '@workspace/api';
import { getCurrentUser } from '@workspace/firebase/auth';
import {
  type BillingKey,
  cancelScheduledPlanChange,
  cancelSubscription,
  completeRetryPayment,
  createFreeSubscription,
  createMockSubscription,
  createSubscriptionWithBillingKey,
  deleteBillingKey,
  reactivateSubscription,
  saveBillingKey,
  schedulePlanChange,
  setDefaultBillingKey,
  upgradePlan,
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
import {
  BILLING_PAYMENT_METHODS,
  DEFAULT_BILLING_CHANNEL,
  type PaymentMethodId,
  PORTONE_STORE_ID,
} from '../../_helpers/constants/portone';
import { usePortoneBilling } from '../../_helpers/hooks/usePortoneBilling';
import { useSubscription } from '../../_helpers/hooks/useSubscription';
import {
  calculateProration,
  type ProrationResult,
} from '../../_helpers/utils/proration';

type BillingClientProps = {
  clubId: number;
};

type ModalStep = 'select-card' | 'confirm' | 'processing' | 'success' | 'error';

export const BillingClient = ({ clubId }: BillingClientProps) => {
  const {
    subscription,
    paymentHistory,
    billingKeys,
    defaultBillingKey,
    isLoading,
    error,
    refetch,
  } = useSubscription({ clubId });
  const { data: myProfile } = useGetMyProfile();
  const { requestBillingKey } = usePortoneBilling();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('select-card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [settingDefaultCardId, setSettingDefaultCardId] = useState<
    string | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [isCancelingScheduledChange, setIsCancelingScheduledChange] =
    useState(false);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);
  const [isYearlyBilling, setIsYearlyBilling] = useState(false);
  const [isScheduledChange, setIsScheduledChange] = useState(false);
  const [proration, setProration] = useState<ProrationResult | null>(null);
  const [isCardRegistrationModalOpen, setIsCardRegistrationModalOpen] =
    useState(false);
  const [selectedBillingKeyForPayment, setSelectedBillingKeyForPayment] =
    useState<BillingKey | null>(null);

  useEffect(() => {
    setIsMockMode(process.env.NEXT_PUBLIC_IS_MOCK === 'true');
  }, []);

  const rawPlanId = subscription?.planId?.toUpperCase() as
    | SubscriptionPlanId
    | undefined;
  const currentPlanId: SubscriptionPlanId =
    rawPlanId && SUBSCRIPTION_PLANS[rawPlanId] ? rawPlanId : 'FREE';

  const isPortoneEnabled = !!PORTONE_STORE_ID;
  const isPaidPlanDisabled = !isMockMode && !isPortoneEnabled;

  const handleOpenModal = (plan: SubscriptionPlanId, isYearly = false) => {
    setSelectedPlan(plan);
    setIsYearlyBilling(isYearly);
    setSelectedBillingKeyForPayment(defaultBillingKey);

    const targetPlan = SUBSCRIPTION_PLANS[plan];
    const isFreeDowngrade = targetPlan.monthlyPrice === 0;

    // 비례 정산 계산 (유료 플랜에서 다른 유료 플랜으로 변경 시)
    // 취소 예정(canceledAt)인 구독도 endDate 전이면 다른 플랜으로 변경 가능
    if (
      subscription &&
      subscription.status === 'active' &&
      currentPlanId !== 'FREE' &&
      !isFreeDowngrade &&
      subscription.startDate &&
      subscription.endDate
    ) {
      // 새 플랜 가격 (빌링 주기에 따라)
      const newPrice = isYearly
        ? targetPlan.monthlyPriceYearly * 12
        : targetPlan.monthlyPrice;

      // 현재 구독의 실제 결제 금액 사용 (플랜 상수가 아닌 실제 저장된 값)
      const currentPrice = subscription.price;
      const currentBillingCycle = subscription.billingCycle ?? 'monthly';
      const newBillingCycle = isYearly ? 'yearly' : 'monthly';

      const prorationResult = calculateProration({
        currentPlanPrice: currentPrice,
        currentBillingCycle,
        newPlanPrice: newPrice,
        newBillingCycle,
        billingStartDate: new Date(subscription.startDate.seconds * 1000),
        billingEndDate: new Date(subscription.endDate.seconds * 1000),
        existingCredit: subscription.credit ?? 0,
      });

      setProration(prorationResult);
    } else {
      setProration(null);
    }

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
    setSelectedBillingKeyForPayment(null);
    setIsScheduledChange(false);
    setProration(null);
  };

  const handleDeleteCard = async (billingKeyId: string) => {
    setDeletingCardId(billingKeyId);

    try {
      await deleteBillingKey(billingKeyId, clubId);
      await refetch();
      showToast({ message: '결제수단이 삭제되었습니다.', type: 'success' });
    } catch (err) {
      console.error('Failed to delete card:', err);

      const message =
        err instanceof Error ? err.message : '결제수단 삭제에 실패했습니다.';

      showToast({ message, type: 'error' });
    } finally {
      setDeletingCardId(null);
    }
  };

  const handleSetDefaultCard = async (billingKeyId: string) => {
    setSettingDefaultCardId(billingKeyId);

    try {
      await setDefaultBillingKey(billingKeyId, clubId);
      await refetch();
      showToast({
        message: '기본 결제수단이 변경되었습니다.',
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to set default card:', err);
      showToast({
        message: '기본 결제수단 변경에 실패했습니다.',
        type: 'error',
      });
    } finally {
      setSettingDefaultCardId(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    setIsCanceling(true);

    try {
      await cancelSubscription(subscription.id);
      await refetch();
      setIsCancelModalOpen(false);
      showToast({ message: '구독 취소가 예약되었습니다.', type: 'success' });
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      showToast({ message: '구독 취소에 실패했습니다.', type: 'error' });
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;

    setIsReactivating(true);

    try {
      await reactivateSubscription(subscription.id);
      await refetch();
      showToast({ message: '구독이 유지됩니다.', type: 'success' });
    } catch (err) {
      console.error('Failed to reactivate subscription:', err);
      showToast({ message: '구독 유지에 실패했습니다.', type: 'error' });
    } finally {
      setIsReactivating(false);
    }
  };

  const handleCancelScheduledChange = async () => {
    if (!subscription) return;

    setIsCancelingScheduledChange(true);

    try {
      await cancelScheduledPlanChange(subscription.id);
      await refetch();
      showToast({
        message: '플랜 변경 예약이 취소되었습니다.',
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to cancel scheduled change:', err);
      showToast({ message: '예약 취소에 실패했습니다.', type: 'error' });
    } finally {
      setIsCancelingScheduledChange(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!subscription || !defaultBillingKey) {
      showToast({
        message: '등록된 결제수단이 없습니다. 결제수단을 먼저 등록해주세요.',
        type: 'error',
      });

      return;
    }

    setIsRetryingPayment(true);

    try {
      const user = getCurrentUser();

      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // 전화번호 필수 체크 (PortOne 요구사항)
      if (!isMockMode && !myProfile?.phoneNumber) {
        throw new Error(
          '결제를 위해 전화번호가 필요합니다. 프로필에서 전화번호를 등록해주세요.',
        );
      }

      const paymentId = `retry_${subscription.clubId}_${Date.now()}_${uuidv4().slice(0, 8)}`;
      const orderName = `${subscription.planName} 플랜 결제 재시도`;

      if (!isMockMode) {
        const paymentResponse = await fetch('/api/portone/billing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            billingKey: defaultBillingKey.billingKey,
            paymentId,
            orderName,
            amount: subscription.price,
            customer: {
              id: user.uid,
              name: myProfile?.nickname ?? user.displayName,
              email: myProfile?.email ?? user.email,
              phoneNumber: myProfile?.phoneNumber,
            },
          }),
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();

          throw new Error(errorData.message ?? '결제에 실패했습니다.');
        }

        const { transactionId } = await paymentResponse.json();

        await completeRetryPayment({
          subscriptionId: subscription.id,
          clubId: subscription.clubId,
          userId: user.uid,
          userEmail: user.email ?? '',
          orderId: paymentId,
          transactionId: transactionId ?? paymentId,
          amount: subscription.price,
        });
      } else {
        // Mock 모드에서는 바로 성공 처리
        await completeRetryPayment({
          subscriptionId: subscription.id,
          clubId: subscription.clubId,
          userId: user.uid,
          userEmail: user.email ?? '',
          orderId: paymentId,
          transactionId: `mock_${paymentId}`,
          amount: subscription.price,
        });
      }

      await refetch();
      showToast({ message: '결제가 완료되었습니다.', type: 'success' });
    } catch (err) {
      console.error('Failed to retry payment:', err);
      showToast({
        message:
          err instanceof Error ? err.message : '결제 재시도에 실패했습니다.',
        type: 'error',
      });
    } finally {
      setIsRetryingPayment(false);
    }
  };

  const handleRegisterMockCard = async (standalone = false) => {
    setIsProcessing(true);

    if (!standalone) {
      setModalStep('processing');
    }

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

      const data = await refetch();

      if (standalone) {
        showToast({ message: '결제수단이 등록되었습니다.', type: 'success' });
      } else {
        // 새로 등록한 카드를 결제수단으로 선택
        if (data) {
          const newDefaultKey =
            data.billingKeys.find((key) => key.isDefault) ??
            data.billingKeys[0] ??
            null;

          setSelectedBillingKeyForPayment(newDefaultKey);
        }

        setModalStep('confirm');
      }
    } catch (err) {
      console.error('Failed to register mock payment method:', err);

      if (standalone) {
        showToast({ message: '결제수단 등록에 실패했습니다.', type: 'error' });
      } else {
        setErrorMessage('결제수단 등록 중 오류가 발생했습니다.');
        setModalStep('error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegisterRealCard = async (
    methodId?: PaymentMethodId,
    standalone = false,
  ) => {
    setIsProcessing(true);

    if (!standalone) {
      setModalStep('processing');
    }

    try {
      const user = getCurrentUser();

      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const methodInfo = BILLING_PAYMENT_METHODS.find((m) => m.id === methodId);
      const channelKey = methodInfo?.channelKey ?? DEFAULT_BILLING_CHANNEL;
      const billingKeyMethod = methodInfo?.billingKeyMethod ?? 'CARD';
      const billingKeyId = `billing_${clubId}_${Date.now()}_${uuidv4().slice(0, 8)}`;

      const result = await requestBillingKey({
        channelKey,
        billingKeyId,
        billingKeyMethod,
        customer: {
          customerId: user.uid,
          fullName: myProfile?.nickname ?? user.displayName ?? undefined,
          email: myProfile?.email ?? user.email ?? undefined,
          phoneNumber: myProfile?.phoneNumber ?? undefined,
        },
      });

      await saveBillingKey({
        clubId,
        userId: user.uid,
        userEmail: user.email ?? '',
        billingKey: result.billingKey,
        customerKey: result.billingKeyId,
        cardCompany: result.cardInfo.cardName || methodInfo?.label || '카드',
        cardNumber: result.cardInfo.cardNumber,
      });

      const data = await refetch();

      if (standalone) {
        showToast({ message: '결제수단이 등록되었습니다.', type: 'success' });
      } else {
        // 새로 등록한 카드를 결제수단으로 선택
        if (data) {
          const newDefaultKey =
            data.billingKeys.find((key) => key.isDefault) ??
            data.billingKeys[0] ??
            null;

          setSelectedBillingKeyForPayment(newDefaultKey);
        }

        setModalStep('confirm');
      }
    } catch (err) {
      console.error('Failed to register payment method:', err);

      // 사용자 취소는 에러로 처리하지 않음
      if (err instanceof Error && err.message === 'USER_CANCEL') {
        return;
      }

      if (standalone) {
        showToast({
          message:
            err instanceof Error
              ? err.message
              : '결제수단 등록에 실패했습니다.',
          type: 'error',
        });
      } else {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : '결제수단 등록창을 열 수 없습니다.',
        );
        setModalStep('error');
      }
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
        ? plan.monthlyPriceYearly * 12
        : plan.monthlyPrice;
      const billingCycle = isYearlyBilling ? '연간' : '월간';

      // 무료 플랜으로 변경하는 경우 (신규 무료 구독)
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

      if (!selectedBillingKeyForPayment) {
        setModalStep('select-card');

        return;
      }

      // 기존 유료 구독이 있는 경우
      const hasExistingPaidSubscription =
        subscription &&
        subscription.status === 'active' &&
        currentPlanId !== 'FREE';

      if (hasExistingPaidSubscription) {
        const isCanceled = !!subscription.canceledAt;
        const currentPlan = SUBSCRIPTION_PLANS[currentPlanId];
        const isSamePlan = plan.id.toUpperCase() === currentPlanId;

        // 같은 플랜 재구독 (취소 예정 → 취소 철회)
        if (isSamePlan && isCanceled) {
          await reactivateSubscription(subscription.id);
          await refetch();
          setModalStep('success');

          return;
        }

        // 업그레이드 또는 빌링 주기 변경: 즉시 적용 + 비례 정산 결제
        // 빌링 주기가 변경되면 다운그레이드여도 즉시 처리 (새로운 빌링 주기 시작)
        const shouldProcessImmediately =
          proration && (proration.isUpgrade || proration.isBillingCycleChange);

        if (shouldProcessImmediately) {
          // 전화번호 필수 체크 (PortOne 요구사항)
          if (!isMockMode && !myProfile?.phoneNumber) {
            throw new Error(
              '결제를 위해 전화번호가 필요합니다. 프로필에서 전화번호를 등록해주세요.',
            );
          }

          const paymentId = `payment_${clubId}_${Date.now()}_${uuidv4().slice(0, 8)}`;
          const amountToPay = proration.amountDue;
          const newBillingCycle = isYearlyBilling ? 'yearly' : 'monthly';

          // 주문명 설정
          const orderName = proration.isBillingCycleChange
            ? `${plan.name} 플랜 (${isYearlyBilling ? '연간' : '월간'} 전환)`
            : `${plan.name} 플랜 업그레이드 (비례 정산)`;

          // 비례 정산 금액이 0보다 크면 결제 진행
          if (amountToPay > 0 && !isMockMode) {
            const paymentResponse = await fetch('/api/portone/billing', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                billingKey: selectedBillingKeyForPayment.billingKey,
                paymentId,
                orderName,
                amount: amountToPay,
                customer: {
                  id: user.uid,
                  name: myProfile?.nickname ?? user.displayName,
                  email: myProfile?.email ?? user.email,
                  phoneNumber: myProfile?.phoneNumber,
                },
              }),
            });

            if (!paymentResponse.ok) {
              const errorData = await paymentResponse.json();

              throw new Error(errorData.message ?? '결제에 실패했습니다.');
            }

            const { transactionId } = await paymentResponse.json();

            await upgradePlan({
              subscriptionId: subscription.id,
              clubId,
              userId: user.uid,
              userEmail: user.email ?? '',
              planId: plan.id,
              planName: plan.name,
              newPrice: billingPrice,
              proratedAmount: amountToPay,
              billingKeyId: selectedBillingKeyForPayment.id,
              orderId: paymentId,
              transactionId: transactionId ?? paymentId,
              newBillingCycle: proration.isBillingCycleChange
                ? newBillingCycle
                : undefined,
              remainingCredit: proration.remainingCredit,
              previousPlanId: currentPlanId,
              previousPlanName: currentPlan.name,
              creditApplied: proration.totalCredit,
            });
          } else {
            // Mock 모드이거나 결제 금액이 0인 경우 플랜만 변경
            await upgradePlan({
              subscriptionId: subscription.id,
              clubId,
              userId: user.uid,
              userEmail: user.email ?? '',
              planId: plan.id,
              planName: plan.name,
              newPrice: billingPrice,
              proratedAmount: amountToPay,
              billingKeyId: selectedBillingKeyForPayment.id,
              orderId: paymentId,
              transactionId: `mock_${paymentId}`,
              newBillingCycle: proration.isBillingCycleChange
                ? newBillingCycle
                : undefined,
              remainingCredit: proration.remainingCredit,
              previousPlanId: currentPlanId,
              previousPlanName: currentPlan.name,
              creditApplied: proration.totalCredit,
            });
          }

          await refetch();
          setModalStep('success');

          return;
        }

        // 다운그레이드 (빌링 주기 동일): 다음 결제일에 플랜 변경 예약
        await schedulePlanChange(
          subscription.id,
          plan.id,
          plan.name,
          billingPrice,
        );
        await refetch();
        setIsScheduledChange(true);
        setModalStep('success');

        return;
      }

      // 신규 유료 구독 (기존 구독 없거나 무료 플랜) → 즉시 결제
      // 전화번호 필수 체크 (PortOne 요구사항)
      if (!isMockMode && !myProfile?.phoneNumber) {
        throw new Error(
          '결제를 위해 전화번호가 필요합니다. 프로필에서 전화번호를 등록해주세요.',
        );
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
          selectedBillingKeyForPayment.id,
          isYearlyBilling,
        );
      } else {
        const paymentId = `payment_${clubId}_${Date.now()}_${uuidv4().slice(0, 8)}`;

        const paymentResponse = await fetch('/api/portone/billing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            billingKey: selectedBillingKeyForPayment.billingKey,
            paymentId,
            orderName: `${plan.name} 플랜 ${billingCycle} 구독`,
            amount: billingPrice,
            customer: {
              id: user.uid,
              name: myProfile?.nickname ?? user.displayName,
              email: myProfile?.email ?? user.email,
              phoneNumber: myProfile?.phoneNumber,
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
          isYearly: isYearlyBilling,
          billingKeyId: selectedBillingKeyForPayment.id,
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
            onReactivateSubscription={handleReactivateSubscription}
            isReactivating={isReactivating}
            onCancelScheduledChange={handleCancelScheduledChange}
            isCancelingScheduledChange={isCancelingScheduledChange}
            onRetryPayment={handleRetryPayment}
            isRetryingPayment={isRetryingPayment}
          />
        </TabsContent>

        <TabsContent value="payment-methods">
          <PaymentMethodsTab
            billingKeys={billingKeys}
            isPaidPlanDisabled={isPaidPlanDisabled}
            isProcessing={isProcessing}
            deletingCardId={deletingCardId}
            settingDefaultCardId={settingDefaultCardId}
            onOpenRegisterModal={() => setIsCardRegistrationModalOpen(true)}
            onDeleteCard={handleDeleteCard}
            onSetDefaultCard={handleSetDefaultCard}
          />
        </TabsContent>

        <TabsContent value="payment-history">
          <PaymentHistoryTab paymentHistory={paymentHistory} />
        </TabsContent>

        <TabsContent value="plans">
          <PlansTab
            currentPlanId={currentPlanId}
            isPaidPlanDisabled={isPaidPlanDisabled}
            isCanceledAndPendingFree={
              !!subscription?.canceledAt && !subscription?.nextPlanId
            }
            scheduledPlanId={
              subscription?.nextPlanId?.toUpperCase() as
                | SubscriptionPlanId
                | undefined
            }
            onReactivate={handleReactivateSubscription}
            isReactivating={isReactivating}
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
              currentPlanId={currentPlanId}
              isYearly={isYearlyBilling}
              billingKeys={billingKeys}
              selectedBillingKey={selectedBillingKeyForPayment}
              proration={proration}
              scheduledDate={
                subscription?.endDate
                  ? new Date(
                      subscription.endDate.seconds * 1000,
                    ).toLocaleDateString('ko-KR')
                  : undefined
              }
              onSelectBillingKey={setSelectedBillingKeyForPayment}
              onPayment={handlePayment}
              onRegisterCard={() => setModalStep('select-card')}
              onClose={handleCloseModal}
            />
          )}

          {modalStep === 'processing' && <ProcessingStep />}

          {modalStep === 'success' && selectedPlan && (
            <SuccessStep
              selectedPlan={selectedPlan}
              isScheduledChange={isScheduledChange}
              scheduledDate={
                subscription?.endDate
                  ? new Date(
                      subscription.endDate.seconds * 1000,
                    ).toLocaleDateString('ko-KR')
                  : undefined
              }
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

      {/* 결제수단 등록 모달 */}
      <Dialog
        open={isCardRegistrationModalOpen}
        onOpenChange={setIsCardRegistrationModalOpen}>
        <DialogContent>
          <SelectCardStep
            isMockMode={isMockMode}
            isProcessing={isProcessing}
            onRegisterPaymentMethod={(methodId) => {
              // 모달을 먼저 닫고 PortOne SDK 호출
              setIsCardRegistrationModalOpen(false);
              handleRegisterRealCard(methodId, true);
            }}
            onRegisterMockCard={() => {
              setIsCardRegistrationModalOpen(false);
              handleRegisterMockCard(true);
            }}
            onClose={() => setIsCardRegistrationModalOpen(false)}
          />
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
