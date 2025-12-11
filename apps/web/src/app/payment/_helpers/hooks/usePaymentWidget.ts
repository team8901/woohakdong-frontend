'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const TOSS_PAYMENTS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY ?? '';

export const usePaymentWidget = (customerKey: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [paymentWidget, setPaymentWidget] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paymentMethodsWidgetRef = useRef<any>(null);

  useEffect(() => {
    const loadWidget = async () => {
      try {
        const { loadPaymentWidget } = await import('@tosspayments/payment-widget-sdk');
        const widget = await loadPaymentWidget(TOSS_PAYMENTS_CLIENT_KEY, customerKey);

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
    async (selector: string, amount: { value: number; currency: string }) => {
      if (!paymentWidget) return null;

      const paymentMethodsWidget = paymentWidget.renderPaymentMethods(selector, amount, {
        variantKey: 'DEFAULT',
      });

      paymentMethodsWidgetRef.current = paymentMethodsWidget;

      return paymentMethodsWidget;
    },
    [paymentWidget],
  );

  const updateAmount = useCallback((amount: { value: number; currency: string }) => {
    if (paymentMethodsWidgetRef.current) {
      paymentMethodsWidgetRef.current.updateAmount(amount);
    }
  }, []);

  const requestPayment = useCallback(
    async (options: {
      orderId: string;
      orderName: string;
      successUrl: string;
      failUrl: string;
      customerEmail?: string;
      customerName?: string;
    }) => {
      if (!paymentWidget) {
        throw new Error('Payment widget not initialized');
      }

      return paymentWidget.requestPayment(options);
    },
    [paymentWidget],
  );

  return {
    paymentWidget,
    renderPaymentMethods,
    updateAmount,
    requestPayment,
    isReady,
  };
};
