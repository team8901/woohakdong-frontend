import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { XCircle } from 'lucide-react';
import { type Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '결제 실패 | 우학동',
  description: '결제에 실패했습니다.',
};

type PaymentFailPageProps = {
  searchParams: Promise<{
    code?: string;
    message?: string;
    orderId?: string;
  }>;
};

const PaymentFailPage = async ({ searchParams }: PaymentFailPageProps) => {
  const params = await searchParams;

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <XCircle className="mx-auto mb-4 size-16 text-red-500" />
          <CardTitle className="text-xl">결제에 실패했습니다</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {params.message ?? '결제 처리 중 오류가 발생했습니다.'}
          </p>
          {params.code && <p className="text-muted-foreground text-sm">오류 코드: {params.code}</p>}
          <div className="flex gap-4">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">홈으로</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/payment">다시 시도</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailPage;
