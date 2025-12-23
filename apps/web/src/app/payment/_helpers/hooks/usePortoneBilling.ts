/**
 * 포트원 정기결제(빌링) 훅
 * 빌링키 발급 로직을 추상화하여 재사용성을 높입니다.
 * @see https://developers.portone.io/
 */
'use client';

import { useCallback, useState } from 'react';

import { PORTONE_STORE_ID } from '../constants/portone';

export type BillingKeyMethod = 'CARD' | 'EASY_PAY';

export type BillingKeyOptions = {
  channelKey: string;
  billingKeyId: string;
  billingKeyMethod?: BillingKeyMethod;
  customer?: {
    customerId?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
  };
};

export type BillingKeyResult = {
  billingKey: string;
  billingKeyId: string;
  cardInfo: {
    cardName: string;
    cardNumber: string;
  };
};

type UsePortoneBillingReturn = {
  requestBillingKey: (options: BillingKeyOptions) => Promise<BillingKeyResult>;
  isLoading: boolean;
  error: string | null;
};

/**
 * 포트원 빌링키 발급 훅
 * @example
 * const { requestBillingKey, isLoading } = usePortoneBilling();
 *
 * const result = await requestBillingKey({
 *   channelKey: 'channel_xxx',
 *   billingKeyId: 'billing_xxx',
 *   billingKeyMethod: 'CARD',
 *   customer: { customerId: 'user_xxx', fullName: '홍길동' },
 * });
 */
export const usePortoneBilling = (): UsePortoneBillingReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestBillingKey = useCallback(
    async (options: BillingKeyOptions): Promise<BillingKeyResult> => {
      if (!PORTONE_STORE_ID) {
        throw new Error('결제 시스템 설정이 완료되지 않았습니다.');
      }

      if (!options.channelKey) {
        throw new Error('결제 채널이 설정되지 않았습니다.');
      }

      setIsLoading(true);
      setError(null);

      try {
        const portoneModule = await import('@portone/browser-sdk/v2');
        const PortOne = portoneModule.default ?? portoneModule;

        const requestParams = {
          storeId: PORTONE_STORE_ID,
          channelKey: options.channelKey,
          billingKeyMethod: options.billingKeyMethod ?? 'CARD',
          issueId: options.billingKeyId,
          issueName: '정기결제 등록',
          customer: options.customer
            ? {
                customerId: options.customer.customerId,
                fullName: options.customer.fullName,
                email: options.customer.email,
                phoneNumber: options.customer.phoneNumber,
              }
            : undefined,
        };

        console.log('[PortOne] requestIssueBillingKey params:', requestParams);

        const response = await PortOne.requestIssueBillingKey(requestParams);

        console.log('[PortOne] requestIssueBillingKey response:', response);

        if (!response) {
          throw new Error('빌링키 발급 응답이 없습니다.');
        }

        if (response.code) {
          if (response.code === 'USER_CANCEL') {
            throw new Error('USER_CANCEL');
          }

          throw new Error(response.message ?? '빌링키 발급에 실패했습니다.');
        }

        if (!response.billingKey) {
          throw new Error('빌링키가 발급되지 않았습니다.');
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseAny = response as any;

        return {
          billingKey: response.billingKey,
          billingKeyId: options.billingKeyId,
          cardInfo: {
            cardName: responseAny.card?.name ?? '',
            cardNumber: responseAny.card?.number ?? '',
          },
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '빌링키 발급에 실패했습니다.';

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    requestBillingKey,
    isLoading,
    error,
  };
};
