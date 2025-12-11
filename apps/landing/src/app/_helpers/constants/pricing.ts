export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    basePrice: 0,
    description: '소규모 동아리를 위한 무료 플랜',
    features: ['최대 20명 회원', '기본 공지사항 기능', '기본 일정 관리'],
    recommended: false,
  },
  STARTER: {
    id: 'starter',
    name: 'Starter',
    basePrice: 50000,
    description: '성장하는 동아리를 위한 플랜',
    features: ['무제한 회원', '모든 Free 기능', '물품 관리 기능', '활동 기록 관리'],
    recommended: true,
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    basePrice: 100000,
    description: '대규모 동아리를 위한 프로 플랜',
    features: ['무제한 회원', '모든 Starter 기능', '고급 통계 및 분석', '우선 지원', '커스텀 브랜딩'],
    recommended: false,
  },
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[SubscriptionPlanId];
