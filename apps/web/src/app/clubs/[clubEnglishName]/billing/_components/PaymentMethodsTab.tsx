import type { PaymentMethodId } from '@/app/payment/_helpers/constants/portone';
import type { BillingKey } from '@workspace/firebase/subscription';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { CreditCard, ShoppingBag, Trash2 } from 'lucide-react';

type PaymentMethodsTabProps = {
  defaultBillingKey: BillingKey | null;
  isPaidPlanDisabled: boolean;
  isProcessing: boolean;
  isDeleting: boolean;
  onRegisterCard: (methodId: PaymentMethodId) => void;
  onDeleteCard: () => void;
};

const getPaymentMethodIcon = (cardCompany: string) => {
  const lowerName = cardCompany.toLowerCase();

  if (lowerName.includes('카카오')) {
    return <CreditCard className="text-muted-foreground size-8" />;
  }

  if (lowerName.includes('네이버')) {
    return <ShoppingBag className="text-muted-foreground size-8" />;
  }

  return <CreditCard className="text-muted-foreground size-8" />;
};

export const PaymentMethodsTab = ({
  defaultBillingKey,
  isPaidPlanDisabled,
  isProcessing,
  isDeleting,
  onRegisterCard,
  onDeleteCard,
}: PaymentMethodsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">결제수단</CardTitle>
        <CardDescription>
          정기 결제에 사용할 결제수단을 관리합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {defaultBillingKey ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                {getPaymentMethodIcon(defaultBillingKey.cardCompany)}
                <div>
                  <p className="font-medium">{defaultBillingKey.cardCompany}</p>
                  <p className="text-muted-foreground text-sm">
                    {defaultBillingKey.cardNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">기본 결제수단</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDeleteCard}
                  disabled={isDeleting}
                  className="text-muted-foreground hover:text-destructive size-8">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            {!isPaidPlanDisabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRegisterCard('card')}
                disabled={isProcessing}>
                {isProcessing ? '등록 중...' : '새 결제수단 등록'}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-muted-foreground text-center">
              <CreditCard className="mx-auto mb-2 size-12 opacity-50" />
              <p>등록된 결제수단이 없습니다.</p>
              <p className="text-sm">
                유료 플랜 구독 시 결제수단을 등록해주세요.
              </p>
            </div>
            {!isPaidPlanDisabled && (
              <Button
                className="w-full"
                onClick={() => onRegisterCard('card')}
                disabled={isProcessing}>
                {isProcessing ? '등록 중...' : '결제수단 등록하기'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
