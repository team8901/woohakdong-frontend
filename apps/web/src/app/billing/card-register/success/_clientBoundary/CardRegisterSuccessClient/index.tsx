'use client';

import { useEffect, useRef, useState } from 'react';

import { onAuthStateChange } from '@workspace/firebase/auth';
import { saveBillingKey } from '@workspace/firebase/subscription';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

type CardRegisterSuccessClientProps = {
  authKey?: string;
  customerKey?: string;
  clubId?: number;
  clubEnglishName?: string;
};

export const CardRegisterSuccessClient = ({
  authKey,
  customerKey,
  clubId,
  clubEnglishName,
}: CardRegisterSuccessClientProps) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isProcessedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (isProcessedRef.current) return;

      isProcessedRef.current = true;

      try {
        if (!user) {
          setError('로그인이 필요합니다.');
          setIsProcessing(false);

          return;
        }

        if (!authKey || !customerKey || !clubId) {
          setError('카드 등록 정보가 올바르지 않습니다.');
          setIsProcessing(false);

          return;
        }

        // 서버에서 빌링키 발급 API 호출
        const response = await fetch('/api/billing/issue-billing-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authKey, customerKey }),
        });

        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(errorData.message ?? '빌링키 발급에 실패했습니다.');
        }

        const { billingKey, card } = await response.json();

        // Firebase에 빌링키 저장
        await saveBillingKey({
          clubId,
          userId: user.uid,
          userEmail: user.email ?? '',
          billingKey,
          customerKey,
          cardCompany: card.company,
          cardNumber: card.number,
        });

        setIsProcessing(false);
      } catch (err) {
        console.error('Card registration failed:', err);
        setError(
          err instanceof Error
            ? err.message
            : '카드 등록 중 오류가 발생했습니다.',
        );
        setIsProcessing(false);
      }
    });

    return () => unsubscribe();
  }, [authKey, customerKey, clubId]);

  const redirectUrl = clubEnglishName
    ? `/clubs/${clubEnglishName}/billing`
    : '/club-list';

  if (isProcessing) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="text-primary mx-auto mb-4 size-16 animate-spin" />
            <CardTitle className="text-xl">카드 등록 중...</CardTitle>
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
            <AlertCircle className="mx-auto mb-4 size-16 text-red-500" />
            <CardTitle className="text-xl text-red-500">
              카드 등록 실패
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">{error}</p>
            <Button asChild className="w-full">
              <Link href={redirectUrl}>돌아가기</Link>
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
          <CardTitle className="text-xl">카드가 등록되었습니다!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            이제 플랜 변경 시 등록된 카드로 결제할 수 있습니다.
          </p>
          <Button asChild className="w-full">
            <Link href={redirectUrl}>결제 관리로 돌아가기</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
