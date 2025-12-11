import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '@/app/payment/_helpers/constants/plans';
import { Button } from '@workspace/ui/components/button';
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Check } from 'lucide-react';

type SuccessStepProps = {
  selectedPlan: SubscriptionPlanId;
  onClose: () => void;
};

export const SuccessStep = ({ selectedPlan, onClose }: SuccessStepProps) => {
  const plan = SUBSCRIPTION_PLANS[selectedPlan];

  return (
    <>
      <DialogHeader className="sr-only">
        <DialogTitle>플랜 변경 완료</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center py-8">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <Check className="size-6 text-green-600 dark:text-green-400" />
        </div>
        <p className="font-medium">플랜이 변경되었습니다!</p>
        <p className="text-muted-foreground text-sm">
          {plan.name} 플랜 구독이 시작되었습니다.
        </p>
      </div>
      <DialogFooter>
        <Button onClick={onClose} className="w-full">
          확인
        </Button>
      </DialogFooter>
    </>
  );
};
