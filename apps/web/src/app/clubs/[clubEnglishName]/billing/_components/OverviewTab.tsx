import type { Subscription } from '@workspace/firebase/subscription';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { EXTERNAL_LINKS } from '@workspace/ui/constants/links';
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '@workspace/ui/constants/plans';
import { AlertCircle, ArrowRight, CreditCard, Wallet } from 'lucide-react';

type OverviewTabProps = {
  subscription: Subscription | null;
  currentPlanId: SubscriptionPlanId;
  onCancelSubscription: () => void;
  onReactivateSubscription?: () => void;
  isReactivating?: boolean;
  onCancelScheduledChange?: () => void;
  isCancelingScheduledChange?: boolean;
  onRetryPayment?: () => void;
  isRetryingPayment?: boolean;
};

export const OverviewTab = ({
  subscription,
  currentPlanId,
  onCancelSubscription,
  onReactivateSubscription,
  isReactivating,
  onCancelScheduledChange,
  isCancelingScheduledChange,
  onRetryPayment,
  isRetryingPayment,
}: OverviewTabProps) => {
  const currentPlan = SUBSCRIPTION_PLANS[currentPlanId] ?? SUBSCRIPTION_PLANS.FREE;
  const isPaidPlan = currentPlan.monthlyPrice > 0;
  // canceledAt이 있으면 취소 예정 (endDate까지 이용 가능)
  const isCanceled = !!subscription?.canceledAt;
  // 결제 실패 상태
  const isPaymentFailed = subscription?.status === 'payment_failed';

  // endDate 처리: Firestore Timestamp 또는 일반 객체 모두 지원
  const getTimestampSeconds = (
    timestamp: { seconds?: number; _seconds?: number } | null | undefined,
  ): number | null => {
    if (!timestamp) return null;

    return timestamp.seconds ?? timestamp._seconds ?? null;
  };

  const endDateSeconds = getTimestampSeconds(
    subscription?.endDate as { seconds?: number; _seconds?: number },
  );
  const endDate = endDateSeconds ? new Date(endDateSeconds * 1000) : null;
  const endDateFormatted = endDate?.toLocaleDateString('ko-KR');

  // 예약된 플랜 변경 정보
  const hasScheduledChange = !!subscription?.nextPlanId;
  const nextPlanId = subscription?.nextPlanId?.toUpperCase() as SubscriptionPlanId | undefined;
  const nextPlan = nextPlanId ? SUBSCRIPTION_PLANS[nextPlanId] : null;

  // 남은 크레딧 정보
  const hasCredit = subscription?.credit && subscription.credit > 0;

  return (
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
          {isPaymentFailed ? (
            <Badge variant="destructive">결제 실패</Badge>
          ) : isCanceled ? (
            <Badge variant="outline" className="border-orange-500 text-orange-600">
              취소 예정
            </Badge>
          ) : (
            <Badge variant="default">활성</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* 결제 실패 안내 */}
        {isPaymentFailed && (
          <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
            <AlertCircle className="size-4 text-red-600" />
            <AlertDescription className="flex flex-col gap-2 text-red-800 dark:text-red-200">
              <span>
                <strong>결제에 실패했습니다.</strong>
                {subscription?.lastPaymentError && (
                  <span className="ml-1">({subscription.lastPaymentError})</span>
                )}
              </span>
              <span className="text-sm">
                결제수단을 확인하고 다시 시도해주세요. 재시도 횟수:{' '}
                {subscription?.retryCount ?? 0}/3
              </span>
              <div className="flex gap-2">
                {onRetryPayment && (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-fit bg-red-600 hover:bg-red-700"
                    onClick={onRetryPayment}
                    disabled={isRetryingPayment}>
                    {isRetryingPayment ? '결제 중...' : '결제 재시도'}
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* 구독 취소 예정 안내 */}
        {isCanceled && endDate && !isPaymentFailed && (
          <Alert className="mb-4 border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
            <AlertCircle className="size-4 text-orange-600" />
            <AlertDescription className="flex flex-col gap-2 text-orange-800 dark:text-orange-200">
              <span>
                구독 취소가 예약되었습니다. <strong>{endDateFormatted}</strong>까지
                현재 플랜의 모든 기능을 계속 이용하실 수 있습니다.
              </span>
              {onReactivateSubscription && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit border-orange-300 text-orange-700 hover:bg-orange-100 hover:text-orange-800"
                  onClick={onReactivateSubscription}
                  disabled={isReactivating}>
                  {isReactivating ? '처리 중...' : '구독 유지하기'}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* 예약된 플랜 변경 안내 */}
        {hasScheduledChange && nextPlan && endDate && !isCanceled && !isPaymentFailed && (
          <Alert className="mb-4">
            <ArrowRight className="size-4" />
            <AlertDescription className="flex flex-col gap-2">
              <span>
                <strong>{endDateFormatted}</strong>부터{' '}
                <strong>{nextPlan.name}</strong> 플랜으로 변경됩니다.
              </span>
              {onCancelScheduledChange && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={onCancelScheduledChange}
                  disabled={isCancelingScheduledChange}>
                  {isCancelingScheduledChange ? '취소 중...' : '예약 취소'}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* 남은 크레딧 안내 */}
        {hasCredit && !isCanceled && !isPaymentFailed && (
          <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <Wallet className="size-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <span>
                <strong>{subscription.credit?.toLocaleString()}원</strong>의 크레딧이
                있습니다. 다음 결제 시 자동으로 차감됩니다.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* 취소 예정 + 크레딧 있을 때 환불 안내 */}
        {hasCredit && isCanceled && !isPaymentFailed && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
            <Wallet className="size-4 text-amber-600" />
            <AlertDescription className="flex flex-col gap-2 text-amber-800 dark:text-amber-200">
              <span>
                <strong>{subscription.credit?.toLocaleString()}원</strong>의 크레딧이
                있습니다. 구독 종료 시 크레딧은 소멸됩니다.
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="w-fit text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                asChild>
                <a
                  href={`mailto:${EXTERNAL_LINKS.SUPPORT_EMAIL}?subject=${encodeURIComponent('크레딧 환불 요청')}&body=${encodeURIComponent(`동아리 ID: ${subscription.clubId}\n구독 ID: ${subscription.id}\n크레딧 금액: ${subscription.credit?.toLocaleString()}원\n\n환불 사유:\n`)}`}>
                  환불 문의하기
                </a>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">플랜</span>
            <span className="font-medium">{currentPlan.name}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {subscription?.billingCycle === 'yearly' ? '연간 결제 금액' : '월 결제 금액'}
            </span>
            <span className="font-medium">
              {!subscription?.price || subscription.price === 0
                ? '무료'
                : `${subscription.price.toLocaleString()}원`}
            </span>
          </div>
          {endDate && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {isCanceled ? '이용 종료일' : '다음 결제일'}
                </span>
                <span className="font-medium">{endDateFormatted}</span>
              </div>
            </>
          )}
        </div>

        {/* 구독 취소 버튼 (유료 플랜 & 취소/예약 변경 없고 & 결제 실패 아닌 경우만 표시) */}
        {isPaidPlan && !isCanceled && !isPaymentFailed && !hasScheduledChange && (
          <>
            <Separator className="my-4" />
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={onCancelSubscription}>
              구독 취소
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
