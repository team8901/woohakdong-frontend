'use client';

import { useEffect, useState } from 'react';

import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '@/app/payment/_helpers/constants/plans';
import { useSubscription } from '@/app/payment/_helpers/hooks/useSubscription';
import { getCurrentUser } from '@workspace/firebase/auth';
import {
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Separator } from '@workspace/ui/components/separator';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { AlertCircle, Check, CreditCard, Loader2, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type BillingClientProps = {
  clubId: number;
};

type ModalStep = 'select-card' | 'register-card' | 'confirm' | 'processing' | 'success' | 'error';

export const BillingClient = ({ clubId }: BillingClientProps) => {
  const { subscription, defaultBillingKey, isLoading, error, refetch } = useSubscription({ clubId });
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('select-card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    setIsMockMode(process.env.NEXT_PUBLIC_IS_MOCK === 'true');
  }, []);

  // 구독이 없으면 Free 플랜으로 간주
  const currentPlanId: SubscriptionPlanId = subscription?.planId
    ? (subscription.planId.toUpperCase() as SubscriptionPlanId)
    : 'FREE';
  const currentPlan = SUBSCRIPTION_PLANS[currentPlanId];

  const isPaidPlanDisabled = !isMockMode;

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

  const handleRegisterCard = async () => {
    if (!isMockMode) {
      setErrorMessage('카드 등록은 현재 준비 중입니다.');
      setModalStep('error');

      return;
    }

    // Mock 환경에서는 가상 카드 등록
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
      console.error('Failed to register card:', err);
      setErrorMessage('카드 등록 중 오류가 발생했습니다.');
      setModalStep('error');
    } finally {
      setIsProcessing(false);
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

      // Mock 환경에서는 실제 결제 API 호출 없이 구독 생성
      await createSubscriptionWithBillingKey(
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
            <p className="font-medium text-red-800 dark:text-red-200">오류 발생</p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
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
                    {new Date(subscription.endDate.seconds * 1000).toLocaleDateString('ko-KR')}
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
          <CardDescription>정기 결제에 사용할 카드를 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {defaultBillingKey ? (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="text-muted-foreground size-8" />
                <div>
                  <p className="font-medium">{defaultBillingKey.cardCompany}</p>
                  <p className="text-muted-foreground text-sm">{defaultBillingKey.cardNumber}</p>
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

      {/* 플랜 변경 버튼 */}
      {selectedPlan && selectedPlan !== currentPlanId && (
        <Button className="w-full" onClick={() => handleOpenModal(selectedPlan)}>
          {SUBSCRIPTION_PLANS[selectedPlan].name} 플랜으로 변경하기
        </Button>
      )}

      {/* 플랜 변경 모달 */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          {/* Step: 카드 선택/등록 */}
          {modalStep === 'select-card' && (
            <>
              <DialogHeader>
                <DialogTitle>결제 수단 등록</DialogTitle>
                <DialogDescription>
                  정기 결제를 위한 카드를 등록해주세요.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="h-auto w-full justify-start p-4"
                  onClick={handleRegisterCard}
                  disabled={isProcessing}>
                  <Plus className="mr-3 size-5" />
                  <div className="text-left">
                    <p className="font-medium">새 카드 등록</p>
                    <p className="text-muted-foreground text-sm">신용/체크카드를 등록합니다</p>
                  </div>
                </Button>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseModal}>
                  취소
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step: 결제 확인 */}
          {modalStep === 'confirm' && selectedPlan && (
            <>
              <DialogHeader>
                <DialogTitle>플랜 변경 확인</DialogTitle>
                <DialogDescription>
                  {SUBSCRIPTION_PLANS[selectedPlan].name} 플랜으로 변경합니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">변경할 플랜</span>
                    <span className="font-medium">{SUBSCRIPTION_PLANS[selectedPlan].name}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">결제 금액</span>
                    <span className="text-primary font-bold">
                      {SUBSCRIPTION_PLANS[selectedPlan].basePrice === 0
                        ? '무료'
                        : `${SUBSCRIPTION_PLANS[selectedPlan].basePrice.toLocaleString()}원/월`}
                    </span>
                  </div>
                </div>
                {defaultBillingKey && SUBSCRIPTION_PLANS[selectedPlan].basePrice > 0 && (
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground mb-1 text-xs">결제 카드</p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-4" />
                      <span className="text-sm">
                        {defaultBillingKey.cardCompany} {defaultBillingKey.cardNumber}
                      </span>
                    </div>
                  </div>
                )}
                {!defaultBillingKey && SUBSCRIPTION_PLANS[selectedPlan].basePrice > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setModalStep('select-card')}>
                    <Plus className="mr-2 size-4" />
                    카드 등록하기
                  </Button>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseModal}>
                  취소
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={!defaultBillingKey && SUBSCRIPTION_PLANS[selectedPlan].basePrice > 0}>
                  {SUBSCRIPTION_PLANS[selectedPlan].basePrice === 0
                    ? '플랜 변경'
                    : `${SUBSCRIPTION_PLANS[selectedPlan].basePrice.toLocaleString()}원 결제하기`}
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step: 처리 중 */}
          {modalStep === 'processing' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="text-primary mb-4 size-12 animate-spin" />
              <p className="font-medium">처리 중...</p>
              <p className="text-muted-foreground text-sm">잠시만 기다려주세요.</p>
            </div>
          )}

          {/* Step: 성공 */}
          {modalStep === 'success' && selectedPlan && (
            <>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Check className="size-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="font-medium">플랜이 변경되었습니다!</p>
                <p className="text-muted-foreground text-sm">
                  {SUBSCRIPTION_PLANS[selectedPlan].name} 플랜 구독이 시작되었습니다.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={handleCloseModal} className="w-full">
                  확인
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step: 에러 */}
          {modalStep === 'error' && (
            <>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                  <AlertCircle className="size-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="font-medium text-red-600 dark:text-red-400">오류 발생</p>
                <p className="text-muted-foreground text-center text-sm">
                  {errorMessage ?? '알 수 없는 오류가 발생했습니다.'}
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseModal}>
                  닫기
                </Button>
                <Button onClick={() => setModalStep('select-card')}>다시 시도</Button>
              </DialogFooter>
            </>
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
