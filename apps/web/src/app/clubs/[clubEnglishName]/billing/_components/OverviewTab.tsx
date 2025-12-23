import type { Subscription } from '@workspace/firebase/subscription';
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
import { CreditCard } from 'lucide-react';

type OverviewTabProps = {
  subscription: Subscription | null;
  currentPlanId: SubscriptionPlanId;
  onCancelSubscription: () => void;
};

export const OverviewTab = ({
  subscription,
  currentPlanId,
  onCancelSubscription,
}: OverviewTabProps) => {
  const currentPlan = SUBSCRIPTION_PLANS[currentPlanId];
  const isPaidPlan = currentPlan.monthlyPrice > 0;

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
              {currentPlan.monthlyPrice === 0
                ? '무료'
                : `${currentPlan.monthlyPrice.toLocaleString()}원`}
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

        {/* 구독 취소 버튼 (유료 플랜일 때만 표시) */}
        {isPaidPlan && (
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
