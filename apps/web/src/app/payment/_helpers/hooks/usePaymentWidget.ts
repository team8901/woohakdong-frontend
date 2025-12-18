'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';

const TOSS_PAYMENTS_CLIENT_KEY =
  process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY ?? '';

type Currency = 'KRW' | 'USD';

type Amount = {
  value: number;
  currency?: Currency;
};

type PaymentOptions = {
  orderId: string;
  orderName: string;
  successUrl: string;
  failUrl: string;
  customerEmail?: string;
  customerName?: string;
};

type PaymentResult = {
  paymentKey: string;
  amount: number;
  orderId: string;
};

type UsePaymentWidgetReturn = {
  renderPaymentMethods: (
    selector: string,
    amount: Amount,
  ) => Promise<unknown | null>;
  updateAmount: (amount: number) => void;
  requestPayment: (options: PaymentOptions) => Promise<PaymentResult | void>;
  isReady: boolean;
};

export const usePaymentWidget = (
  customerKey: string,
): UsePaymentWidgetReturn => {
  const [paymentWidget, setPaymentWidget] =
    useState<PaymentWidgetInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const paymentMethodsWidgetRef = useRef<ReturnType<
    PaymentWidgetInstance['renderPaymentMethods']
  > | null>(null);

  useEffect(() => {
    const loadWidget = async () => {
      try {
        const { loadPaymentWidget } = await import(
          '@tosspayments/payment-widget-sdk'
        );
        const widget = await loadPaymentWidget(
          TOSS_PAYMENTS_CLIENT_KEY,
          customerKey,
        );

        setPaymentWidget(widget);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to load payment widget:', error);
      }
    };

    if (TOSS_PAYMENTS_CLIENT_KEY) {
      loadWidget();
    }
  }, [customerKey]);

  const renderPaymentMethods = useCallback(
    async (selector: string, amount: Amount) => {
      if (!paymentWidget) return null;

      const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
        selector,
        amount,
        {
          variantKey: 'DEFAULT',
        },
      );

      paymentMethodsWidgetRef.current = paymentMethodsWidget;

      return paymentMethodsWidget;
    },
    [paymentWidget],
  );

  const updateAmount = useCallback((amount: number) => {
    if (paymentMethodsWidgetRef.current) {
      paymentMethodsWidgetRef.current.updateAmount(amount);
    }
  }, []);

  const requestPayment = useCallback(
    async (options: PaymentOptions) => {
      if (!paymentWidget) {
        throw new Error('Payment widget not initialized');
      }

      return paymentWidget.requestPayment(options);
    },
    [paymentWidget],
  );

  return {
    renderPaymentMethods,
    updateAmount,
    requestPayment,
    isReady,
  };
};
