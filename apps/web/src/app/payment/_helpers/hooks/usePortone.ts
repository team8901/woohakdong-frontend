/**
 * 포트원 결제 훅
 * @see https://developers.portone.io/
 */
'use client';

import { useCallback, useEffect, useState } from 'react';

import { PORTONE_STORE_ID } from '../constants/portone';

type PaymentOptions = {
  channelKey: string;
  orderId: string;
  orderName: string;
  amount: number;
  currency?: string;
  customer?: {
    customerId?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
  };
};

type PaymentResult = {
  paymentId: string;
  transactionType: string;
  txId?: string;
  code?: string;
  message?: string;
};

type UsePortoneReturn = {
  requestPayment: (options: PaymentOptions) => Promise<PaymentResult>;
  isReady: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PortOneModule = any;

export const usePortone = (): UsePortoneReturn => {
  const [isReady, setIsReady] = useState(false);
  const [portone, setPortone] = useState<PortOneModule | null>(null);

  useEffect(() => {
    const loadPortone = async () => {
      try {
        const portoneModule = await import('@portone/browser-sdk/v2');

        setPortone(portoneModule);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to load PortOne SDK:', error);
      }
    };

    if (PORTONE_STORE_ID) {
      loadPortone();
    }
  }, []);

  const requestPayment = useCallback(
    async (options: PaymentOptions): Promise<PaymentResult> => {
      if (!portone) {
        throw new Error('PortOne SDK not initialized');
      }

      const PortOne = portone.default ?? portone;

      const response = await PortOne.requestPayment({
        storeId: PORTONE_STORE_ID,
        channelKey: options.channelKey,
        paymentId: options.orderId,
        orderName: options.orderName,
        totalAmount: options.amount,
        currency: options.currency ?? 'KRW',
        payMethod: 'CARD',
        customer: options.customer
          ? {
              customerId: options.customer.customerId,
              fullName: options.customer.fullName,
              email: options.customer.email,
              phoneNumber: options.customer.phoneNumber,
            }
          : undefined,
      });

      if (response.code) {
        throw new Error(response.message ?? '결제에 실패했습니다.');
      }

      return {
        paymentId: response.paymentId,
        transactionType: response.transactionType,
        txId: response.txId,
      };
    },
    [portone],
  );

  return {
    requestPayment,
    isReady,
  };
};
