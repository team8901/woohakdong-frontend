'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { onAuthStateChange } from '@workspace/firebase/auth';
import {
  getActiveSubscription,
  getPaymentHistory,
  type PaymentRecord,
  type Subscription,
} from '@workspace/firebase/subscription';

type UseSubscriptionProps = {
  clubId: number;
};

type UseSubscriptionReturn = {
  subscription: Subscription | null;
  paymentHistory: PaymentRecord[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * 동아리의 구독 정보와 결제 내역을 조회하는 훅
 * Firebase Auth 상태가 복원된 후에 조회합니다.
 * @param clubId - 동아리 ID
 */
export const useSubscription = ({
  clubId,
}: UseSubscriptionProps): UseSubscriptionReturn => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchedRef = useRef(false);

  const fetchSubscriptionData = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const [subscriptionData, payments] = await Promise.all([
        getActiveSubscription(id),
        getPaymentHistory(id),
      ]);

      setSubscription(subscriptionData);
      setPaymentHistory(payments);
    } catch (err) {
      console.error('Failed to fetch subscription data:', err);
      setError('구독 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchSubscriptionData(clubId);
  }, [fetchSubscriptionData, clubId]);

  useEffect(() => {
    if (!clubId) return;

    // Firebase Auth 상태가 복원될 때까지 기다림
    const unsubscribe = onAuthStateChange((user) => {
      // 이미 fetch 완료된 경우 skip
      if (isFetchedRef.current) return;

      if (user) {
        isFetchedRef.current = true;
        fetchSubscriptionData(clubId);
      } else {
        // 로그인되지 않은 경우 구독 없음으로 처리
        setSubscription(null);
        setPaymentHistory([]);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
      isFetchedRef.current = false;
    };
  }, [clubId, fetchSubscriptionData]);

  return {
    subscription,
    paymentHistory,
    isLoading,
    error,
    refetch,
  };
};
