/**
 * 포트원 결제 관련 상수
 * @see https://developers.portone.io/
 */

/**
 * 포트원 Store ID
 * 포트원 관리자 콘솔에서 확인 가능
 */
export const PORTONE_STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? '';

/**
 * PG사별 채널 키
 * 포트원 관리자 > 결제 연동 > 채널 관리에서 확인
 */
export const PORTONE_CHANNEL_KEY = {
  /** KG이니시스 - 빌링키 정기결제 (카드만) */
  INICIS_BILLING: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_INICIS_BILLING ?? '',
} as const;

/**
 * 결제 수단 타입
 */
export const PORTONE_PAY_METHOD = {
  CARD: 'CARD',
} as const;

export type PortonePayMethod =
  (typeof PORTONE_PAY_METHOD)[keyof typeof PORTONE_PAY_METHOD];

/**
 * 정기결제용 결제수단 (카드만)
 * - 빌링키 발급 후 자동 갱신
 */
export const PAYMENT_METHODS = [
  {
    id: 'card',
    channelKey: PORTONE_CHANNEL_KEY.INICIS_BILLING,
    label: '신용/체크카드',
    description: '카드 정기결제 (자동 갱신)',
    icon: 'credit-card',
    billingKeyMethod: 'CARD' as const,
  },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]['id'];

/**
 * 기본 빌링 채널 (정기결제용)
 */
export const DEFAULT_BILLING_CHANNEL = PORTONE_CHANNEL_KEY.INICIS_BILLING;

/**
 * 기본 결제수단 ID
 */
export const DEFAULT_PAYMENT_METHOD_ID: PaymentMethodId = 'card';
