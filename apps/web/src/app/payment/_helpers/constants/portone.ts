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
 *
 * [결제수단 추가 시 참고]
 * - 새 PG 채널 추가: 포트원 관리자 콘솔에서 채널 생성 후 채널 키 추가
 * - KCP/이니시스 카드 정기결제: billingKeyMethod를 'CARD'로 설정 필요
 * - 간편결제(카카오페이/네이버페이) 정기결제: billingKeyMethod를 'EASY_PAY'로 설정
 */
export const PORTONE_CHANNEL_KEY = {
  /** 카카오페이 - 정기결제 (현재 사용 중) */
  KAKAOPAY_BILLING:
    process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KAKAOPAY_BILLING ?? '',

  // [추후 추가 가능한 결제수단]
  // /** 카카오페이 - 일반결제 */
  // KAKAOPAY: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KAKAOPAY ?? '',
  // /** 네이버페이 - 일반결제 */
  // NAVERPAY: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_NAVERPAY ?? '',
  // /** KG이니시스 - 카드 정기결제 */
  // INICIS_BILLING: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_INICIS_BILLING ?? '',
} as const;

/**
 * 결제 수단 타입
 */
export const PORTONE_PAY_METHOD = {
  CARD: 'CARD',
  EASY_PAY: 'EASY_PAY',
} as const;

export type PortonePayMethod =
  (typeof PORTONE_PAY_METHOD)[keyof typeof PORTONE_PAY_METHOD];

/**
 * 지원하는 결제 수단 목록
 *
 * [결제수단 추가 방법]
 * 1. PORTONE_CHANNEL_KEY에 새 채널 키 추가
 * 2. 아래 배열에 결제수단 정보 추가
 * 3. BillingClient에서 billingKeyMethod 설정 확인 (CARD vs EASY_PAY)
 */
export const SUPPORTED_PAYMENT_METHODS = [
  {
    id: 'kakaopay',
    channelKey: PORTONE_CHANNEL_KEY.KAKAOPAY_BILLING,
    label: '카카오페이',
    description: '카카오페이 정기결제',
    icon: 'kakaopay',
    supportsBilling: true,
    billingKeyMethod: 'EASY_PAY' as const,
  },

  // [추후 추가 가능한 결제수단 예시]
  // {
  //   id: 'inicis',
  //   channelKey: PORTONE_CHANNEL_KEY.INICIS_BILLING,
  //   label: '신용/체크카드',
  //   description: 'KG이니시스 카드 정기결제',
  //   icon: 'credit-card',
  //   supportsBilling: true,
  //   billingKeyMethod: 'CARD' as const,
  // },
] as const;

/**
 * 정기결제(빌링) 지원 결제 수단만 필터링
 */
export const BILLING_PAYMENT_METHODS = SUPPORTED_PAYMENT_METHODS.filter(
  (m) => m.supportsBilling,
);

export type PaymentMethodId = (typeof SUPPORTED_PAYMENT_METHODS)[number]['id'];

/**
 * 기본 빌링 채널 (카카오페이)
 */
export const DEFAULT_BILLING_CHANNEL = PORTONE_CHANNEL_KEY.KAKAOPAY_BILLING;

/**
 * 기본 결제수단 ID
 */
export const DEFAULT_PAYMENT_METHOD_ID: PaymentMethodId = 'kakaopay';
