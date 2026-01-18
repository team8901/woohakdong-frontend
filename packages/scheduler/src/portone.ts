/**
 * PortOne 빌링키 결제 처리
 *
 * @see https://developers.portone.io/
 */

import { queryFirestore } from './firebase';
import type {
  BillingKey,
  Env,
  PaymentResponse,
  PortonePaymentResponse,
} from './types';
import { BILLING_KEYS_COLLECTION } from './types';

/**
 * 포트원 빌링키 결제
 */
export const processBillingPayment = async (
  env: Env,
  billingKey: string,
  amount: number,
  paymentId: string,
  orderName: string,
): Promise<PaymentResponse> => {
  if (!env.PORTONE_API_SECRET) {
    return {
      success: false,
      error: {
        code: 'MISSING_CONFIG',
        message:
          'PORTONE_API_SECRET is not set. Please check your .dev.vars or Cloudflare secrets.',
      },
    };
  }

  const response = await fetch(
    `https://api.portone.io/payments/${encodeURIComponent(paymentId)}/billing-key`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `PortOne ${env.PORTONE_API_SECRET}`,
      },
      body: JSON.stringify({
        billingKey,
        orderName,
        amount: {
          total: amount,
        },
        currency: 'KRW',
      }),
    },
  );

  const responseText = await response.text();

  // HTML 응답 체크
  if (
    responseText.startsWith('<!DOCTYPE') ||
    responseText.startsWith('<html')
  ) {
    return {
      success: false,
      error: { code: 'HTML_RESPONSE', message: '결제 API 응답 오류' },
    };
  }

  const data = JSON.parse(responseText) as PortonePaymentResponse;

  if (!response.ok) {
    return {
      success: false,
      error: {
        code: data.status ?? 'UNKNOWN',
        message: data.message ?? '결제 실패',
      },
    };
  }

  return {
    success: true,
    data: {
      // PortOne 응답에 없으면 요청 시 사용한 paymentId 사용
      paymentId: data.paymentId ?? paymentId,
      transactionId: data.transactionId ?? `txn_${paymentId}`,
      amount: data.amount?.paid ?? amount,
      paidAt: data.paidAt ?? new Date().toISOString(),
    },
  };
};

/**
 * 동아리의 기본 빌링키 조회
 */
export const getDefaultBillingKey = async (
  env: Env,
  firebaseToken: string,
  clubId: number,
): Promise<BillingKey | null> => {
  const billingKeys = (await queryFirestore(
    env,
    firebaseToken,
    BILLING_KEYS_COLLECTION,
    [
      { field: 'clubId', op: 'EQUAL', value: clubId },
      { field: 'isDefault', op: 'EQUAL', value: true },
    ],
  )) as BillingKey[];

  const defaultKey = billingKeys[0];

  if (!defaultKey || !defaultKey.billingKey) {
    return null;
  }

  return defaultKey;
};
