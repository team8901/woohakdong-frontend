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
import { CreditCard, Loader2, Star, Trash2 } from 'lucide-react';

import { PaymentMethodIcon } from '../_helpers/utils/paymentMethodIcon';

type PaymentMethodsTabProps = {
  billingKeys: BillingKey[];
  isPaidPlanDisabled: boolean;
  isProcessing: boolean;
  deletingCardId: string | null;
  settingDefaultCardId: string | null;
  onOpenRegisterModal: () => void;
  onDeleteCard: (billingKeyId: string) => void;
  onSetDefaultCard: (billingKeyId: string) => void;
};

export const PaymentMethodsTab = ({
  billingKeys,
  isPaidPlanDisabled,
  isProcessing,
  deletingCardId,
  settingDefaultCardId,
  onOpenRegisterModal,
  onDeleteCard,
  onSetDefaultCard,
}: PaymentMethodsTabProps) => {
  const hasCards = billingKeys.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">결제수단</CardTitle>
        <CardDescription>
          정기 결제에 사용할 결제수단을 관리합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasCards ? (
          <div className="space-y-3">
            {billingKeys.map((billingKey) => {
              const isDefault = billingKey.isDefault;
              const isDeleting = deletingCardId === billingKey.id;
              const isSettingDefault = settingDefaultCardId === billingKey.id;

              return (
                <div
                  key={billingKey.id}
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    isDefault ? 'border-primary bg-primary/5' : ''
                  }`}>
                  <div className="flex items-center gap-3">
                    <PaymentMethodIcon
                      cardCompany={billingKey.cardCompany}
                      size={32}
                    />
                    <div>
                      <p className="font-medium">{billingKey.cardCompany}</p>
                      <p className="text-muted-foreground text-sm">
                        {billingKey.cardNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isDefault ? (
                      <Badge variant="default">기본</Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSetDefaultCard(billingKey.id)}
                        disabled={isSettingDefault}>
                        {isSettingDefault ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Star className="size-4" />
                        )}
                        기본으로 설정
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteCard(billingKey.id)}
                      disabled={isDeleting}
                      className="text-muted-foreground hover:text-destructive size-8">
                      {isDeleting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
            {!isPaidPlanDisabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenRegisterModal}
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
                onClick={onOpenRegisterModal}
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
