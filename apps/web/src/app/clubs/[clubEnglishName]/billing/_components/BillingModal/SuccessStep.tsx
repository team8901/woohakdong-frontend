import { Button } from '@workspace/ui/components/button';
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '@workspace/ui/constants/plans';
import { Calendar, Check } from 'lucide-react';

type SuccessStepProps = {
  selectedPlan: SubscriptionPlanId;
  isScheduledChange?: boolean;
  scheduledDate?: string;
  onClose: () => void;
};

export const SuccessStep = ({
  selectedPlan,
  isScheduledChange,
  scheduledDate,
  onClose,
}: SuccessStepProps) => {
  const plan = SUBSCRIPTION_PLANS[selectedPlan];

  return (
    <>
      <DialogHeader className="sr-only">
        <DialogTitle>
          {isScheduledChange ? '플랜 변경 예약 완료' : '플랜 변경 완료'}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center py-8">
        <div
          className={`mb-4 flex size-12 items-center justify-center rounded-full ${
            isScheduledChange
              ? 'bg-blue-100 dark:bg-blue-900'
              : 'bg-green-100 dark:bg-green-900'
          }`}>
          {isScheduledChange ? (
            <Calendar className="size-6 text-blue-600 dark:text-blue-400" />
          ) : (
            <Check className="size-6 text-green-600 dark:text-green-400" />
          )}
        </div>
        {isScheduledChange ? (
          <>
            <p className="font-medium">플랜 변경이 예약되었습니다!</p>
            <p className="text-muted-foreground text-center text-sm">
              {scheduledDate}부터 {plan.name} 플랜으로 변경됩니다.
            </p>
          </>
        ) : (
          <>
            <p className="font-medium">플랜이 변경되었습니다!</p>
            <p className="text-muted-foreground text-sm">
              {plan.name} 플랜 구독이 시작되었습니다.
            </p>
          </>
        )}
      </div>
      <DialogFooter>
        <Button onClick={onClose} className="w-full">
          확인
        </Button>
      </DialogFooter>
    </>
  );
};
