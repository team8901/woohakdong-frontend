'use client';

import { useEffect, useRef, useState } from 'react';

import { onAuthStateChange } from '@workspace/firebase/auth';
import { createSubscription } from '@workspace/firebase/subscription';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

type PaymentSuccessClientProps = {
  orderId?: string;
  paymentKey?: string;
  amount?: string;
  plan?: string;
  planName?: string;
  clubId?: number;
  clubEnglishName?: string;
};

export const PaymentSuccessClient = ({
  orderId,
  paymentKey,
  amount,
  plan,
  planName,
  clubId,
  clubEnglishName,
}: PaymentSuccessClientProps) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const isProcessedRef = useRef(false);

  useEffect(() => {
    // Firebase Auth 상태가 복원될 때까지 기다림
    const unsubscribe = onAuthStateChange(async (user) => {
      // 중복 처리 방지
      if (isProcessedRef.current) return;

      isProcessedRef.current = true;

      try {
        if (!user) {
          setError('로그인이 필요합니다. 다시 로그인 후 시도해주세요.');
          setIsProcessing(false);

          return;
        }

        if (!orderId || !paymentKey || !amount || !clubId) {
          setError('결제 정보가 올바르지 않습니다.');
          setIsProcessing(false);

          return;
        }

        const subId = await createSubscription({
          clubId,
          userId: user.uid,
          userEmail: user.email ?? '',
          planId: plan ?? 'starter',
          planName: planName ?? 'Starter',
          price: Number(amount),
          orderId,
          paymentKey,
        });

        setSubscriptionId(subId);
        setIsProcessing(false);
      } catch (err) {
        console.error('Payment processing failed:', err);
        setError('결제 처리 중 오류가 발생했습니다. 고객센터에 문의해주세요.');
        setIsProcessing(false);
      }
    });

    return () => unsubscribe();
  }, [orderId, paymentKey, amount, plan, planName, clubId]);

  if (isProcessing) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="text-primary mx-auto mb-4 size-16 animate-spin" />
            <CardTitle className="text-xl">결제 처리 중...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">잠시만 기다려주세요.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-500">오류 발생</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">{error}</p>
            {orderId && (
              <p className="text-muted-foreground text-sm">
                주문번호: {orderId}
              </p>
            )}
            <Button asChild className="w-full">
              <Link href="/payment">다시 시도</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto mb-4 size-16 text-green-500" />
          <CardTitle className="text-xl">결제가 완료되었습니다!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">우학동 구독이 시작되었습니다.</p>
          {subscriptionId && (
            <p className="text-muted-foreground text-sm">
              구독번호: {subscriptionId}
            </p>
          )}
          {orderId && (
            <p className="text-muted-foreground text-sm">주문번호: {orderId}</p>
          )}
          {amount && (
            <p className="text-muted-foreground text-sm">
              결제금액: {Number(amount).toLocaleString()}원
            </p>
          )}
          <Button asChild className="w-full">
            <Link href={clubEnglishName ? `/clubs/${clubEnglishName}` : '/club-list'}>
              동아리 관리 시작하기
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
