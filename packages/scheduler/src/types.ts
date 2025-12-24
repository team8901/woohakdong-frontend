/**
 * 스케줄러 타입 정의
 */

// ===== 환경변수 =====

export interface Env {
  PORTONE_API_SECRET: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_SERVICE_ACCOUNT_KEY: string;
  ENVIRONMENT: string;
  /** 테스트 엔드포인트 접근용 API 키 (선택) */
  SCHEDULER_API_KEY?: string;
  /** 테스트 빌링 주기 (분 단위, 선택) */
  TEST_BILLING_CYCLE_MINUTES?: string;
}

// ===== 상수 =====

export const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
export const PAYMENTS_COLLECTION = 'payments';
export const BILLING_KEYS_COLLECTION = 'billingKeys';
export const MAX_RETRY_COUNT = 3;

// ===== 구독 관련 타입 =====

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'expired'
  | 'pending'
  | 'payment_failed';

export type BillingCycle = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  clubId: number;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  price: number;
  billingCycle: BillingCycle;
  billingKeyId: string;
  status: SubscriptionStatus;
  startDate: { _seconds: number };
  endDate: { _seconds: number };
  retryCount?: number;
  lastPaymentError?: string;
  /** 구독 취소 시점 (취소했지만 endDate까지 이용 가능) */
  canceledAt?: { _seconds: number };
  /** 예약된 플랜 변경 */
  nextPlanId?: string;
  nextPlanName?: string;
  nextPlanPrice?: number;
  /** 빌링 주기 변경 시 남은 크레딧 */
  credit?: number;
}

// ===== 빌링키 관련 타입 =====

export interface BillingKey {
  id: string;
  clubId: number;
  billingKey: string;
  customerKey: string;
  cardCompany: string;
  cardNumber: string;
  isDefault: boolean;
}

// ===== PortOne 관련 타입 =====

export interface PortonePaymentResponse {
  paymentId: string;
  transactionId: string;
  status: string;
  paidAt?: string;
  amount?: {
    total: number;
    paid: number;
  };
  message?: string;
}

export interface PaymentResult {
  success: true;
  data: {
    paymentId: string;
    transactionId: string;
    amount: number;
    paidAt: string;
  };
}

export interface PaymentError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type PaymentResponse = PaymentResult | PaymentError;

