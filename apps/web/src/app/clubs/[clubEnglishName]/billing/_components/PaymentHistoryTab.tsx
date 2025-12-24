import type {
  PaymentRecord,
  PaymentRecordType,
} from '@workspace/firebase/subscription';
import { Badge } from '@workspace/ui/components/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { ArrowRight, Receipt } from 'lucide-react';

type PaymentHistoryTabProps = {
  paymentHistory: PaymentRecord[];
};

const getStatusBadge = (status: PaymentRecord['status']) => {
  switch (status) {
    case 'success':
      return (
        <Badge
          variant="outline"
          className="border-green-500 text-green-700 dark:text-green-400">
          성공
        </Badge>
      );
    case 'failed':
      return (
        <Badge
          variant="outline"
          className="border-red-500 text-red-700 dark:text-red-400">
          실패
        </Badge>
      );
    case 'pending':
      return (
        <Badge
          variant="outline"
          className="border-yellow-500 text-yellow-700 dark:text-yellow-400">
          대기중
        </Badge>
      );

    default:
      return <Badge variant="outline">-</Badge>;
  }
};

const getTypeLabel = (type?: PaymentRecordType): string => {
  switch (type) {
    case 'renewal':
      return '정기 결제';
    case 'plan_change':
      return '플랜 변경';
    case 'upgrade':
      return '업그레이드';
    case 'billing_cycle_change':
      return '결제 주기 변경';
    case 'downgrade_to_free':
      return '무료 전환';
    case 'subscription_canceled':
      return '구독 종료';
    case 'credit_applied':
      return '크레딧 적용';

    default:
      return '결제';
  }
};

export const PaymentHistoryTab = ({
  paymentHistory,
}: PaymentHistoryTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="size-5" />
          결제내역
        </CardTitle>
        <CardDescription>
          정기 결제 및 플랜 변경 내역을 확인할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {paymentHistory.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <Receipt className="mx-auto mb-2 size-12 opacity-50" />
            <p>결제내역이 없습니다.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>결제일</TableHead>
                <TableHead>유형</TableHead>
                <TableHead>플랜</TableHead>
                <TableHead className="text-right">금액</TableHead>
                <TableHead className="text-center">상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {record.createdAt
                      ? new Date(
                          record.createdAt.seconds * 1000,
                        ).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {getTypeLabel(record.type)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {record.previousPlanName ? (
                      <span className="flex items-center gap-1">
                        <span className="text-muted-foreground">
                          {record.previousPlanName}
                        </span>
                        <ArrowRight className="text-muted-foreground size-3" />
                        <span>{record.planName}</span>
                      </span>
                    ) : (
                      record.planName
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {record.amount === 0 ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      `${record.amount.toLocaleString()}원`
                    )}
                    {record.creditApplied && record.creditApplied > 0 && (
                      <div className="text-muted-foreground text-xs">
                        (크레딧 {record.creditApplied.toLocaleString()}원 적용)
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(record.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
