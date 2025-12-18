/**
 * 포트원 정기결제(빌링) 훅
 * @see https://developers.portone.io/
 */
'use client';

import { useCallback, useEffect, useState } from 'react';

import { PORTONE_STORE_ID } from '../constants/portone';

type BillingKeyOptions = {
  channelKey: string;
  billingKeyId: string; // 고유한 빌링키 ID
  customer?: {
    customerId?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
  };
};

type BillingKeyResult = {
  billingKey: string;
  cardInfo?: {
    cardName?: string;
    cardNumber?: string;
  };
};

type UsePortoneBillingReturn = {
  requestBillingKey: (options: BillingKeyOptions) => Promise<BillingKeyResult>;
  isReady: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PortOneModule = any;

export const usePortoneBilling = (): UsePortoneBillingReturn => {
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

  /**
   * 빌링키 발급 요청
   * 사용자가 카드 정보를 입력하면 빌링키를 발급받습니다.
   */
  const requestBillingKey = useCallback(
    async (options: BillingKeyOptions): Promise<BillingKeyResult> => {
      if (!portone) {
        throw new Error('PortOne SDK not initialized');
      }

      const PortOne = portone.default ?? portone;

      console.log('[PortOne] requestIssueBillingKey params:', {
        storeId: PORTONE_STORE_ID,
        channelKey: options.channelKey,
        issueId: options.billingKeyId,
      });

      const response = await PortOne.requestIssueBillingKey({
        storeId: PORTONE_STORE_ID,
        channelKey: options.channelKey,
        issueId: options.billingKeyId,
        issueName: '정기결제 카드 등록',
        customer: options.customer
          ? {
              customerId: options.customer.customerId,
              fullName: options.customer.fullName,
              email: options.customer.email,
              phoneNumber: options.customer.phoneNumber,
            }
          : undefined,
      });

      console.log('[PortOne] requestIssueBillingKey response:', response);

      if (response.code) {
        // 사용자 취소
        if (response.code === 'USER_CANCEL') {
          throw new Error('cancel');
        }

        throw new Error(response.message ?? '빌링키 발급에 실패했습니다.');
      }

      return {
        billingKey: response.billingKey,
        cardInfo: {
          cardName: response.card?.name,
          cardNumber: response.card?.number,
        },
      };
    },
    [portone],
  );

  return {
    requestBillingKey,
    isReady,
  };
};
