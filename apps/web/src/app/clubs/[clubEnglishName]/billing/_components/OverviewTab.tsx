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
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '@workspace/ui/constants/plans';
import { AlertCircle, ArrowRight, CreditCard } from 'lucide-react';

type OverviewTabProps = {
  subscription: Subscription | null;
  currentPlanId: SubscriptionPlanId;
  onCancelSubscription: () => void;
  onReactivateSubscription?: () => void;
  isReactivating?: boolean;
  onCancelScheduledChange?: () => void;
  isCancelingScheduledChange?: boolean;
};

export const OverviewTab = ({
  subscription,
  currentPlanId,
  onCancelSubscription,
  onReactivateSubscription,
  isReactivating,
  onCancelScheduledChange,
  isCancelingScheduledChange,
}: OverviewTabProps) => {
  const currentPlan = SUBSCRIPTION_PLANS[currentPlanId] ?? SUBSCRIPTION_PLANS.FREE;
  const isPaidPlan = currentPlan.monthlyPrice > 0;
  // canceledAt이 있으면 취소 예정 (endDate까지 이용 가능)
  const isCanceled = !!subscription?.canceledAt;

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
          {isCanceled ? (
            <Badge variant="outline" className="border-orange-500 text-orange-600">
              취소 예정
            </Badge>
          ) : (
            <Badge variant="default">활성</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* 구독 취소 예정 안내 */}
        {isCanceled && endDate && (
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
        {hasScheduledChange && nextPlan && endDate && !isCanceled && (
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">플랜</span>
            <span className="font-medium">{currentPlan.name}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">월 결제 금액</span>
            <span className="font-medium">
              {currentPlan.monthlyPrice === 0
                ? '무료'
                : `${currentPlan.monthlyPrice.toLocaleString()}원`}
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

        {/* 구독 취소 버튼 (유료 플랜 & 취소 안 된 경우만 표시) */}
        {isPaidPlan && !isCanceled && (
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
