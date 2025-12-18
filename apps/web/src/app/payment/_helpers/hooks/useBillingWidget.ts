'use client';

import { useCallback, useEffect, useState } from 'react';

import type { TossPaymentsInstance } from '@tosspayments/payment-sdk';

const TOSS_PAYMENTS_CLIENT_KEY =
  process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY ?? '';

type BillingAuthOptions = {
  customerKey: string;
  successUrl: string;
  failUrl: string;
  customerEmail?: string;
  customerName?: string;
};

type UseBillingWidgetReturn = {
  requestBillingAuth: (options: BillingAuthOptions) => Promise<unknown>;
  isReady: boolean;
};

export const useBillingWidget = (): UseBillingWidgetReturn => {
  const [tossPayments, setTossPayments] =
    useState<TossPaymentsInstance | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadToss = async () => {
      try {
        const { loadTossPayments } = await import('@tosspayments/payment-sdk');
        const instance = await loadTossPayments(TOSS_PAYMENTS_CLIENT_KEY);

        setTossPayments(instance);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to load TossPayments SDK:', error);
      }
    };

    if (TOSS_PAYMENTS_CLIENT_KEY) {
      loadToss();
    }
  }, []);

  /**
   * 빌링키 발급을 위한 카드 등록창 호출
   */
  const requestBillingAuth = useCallback(
    async (options: BillingAuthOptions) => {
      if (!tossPayments) {
        throw new Error('TossPayments SDK not initialized');
      }

      return tossPayments.requestBillingAuth('카드', options);
    },
    [tossPayments],
  );

  return {
    requestBillingAuth,
    isReady,
  };
};
