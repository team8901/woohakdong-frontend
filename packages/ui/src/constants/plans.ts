export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    description: '동아리를 시작하는 분들을 위한 플랜',
    features: [
      '최대 30명 회원 관리',
      '공지사항 게시 (월 10개)',
      '일정 관리 (캘린더)',
      '동아리 전용 페이지',
      '가입 신청서 1개',
    ],
    recommended: false,
    contactOnly: false,
    comingSoon: false,
  },
  STANDARD: {
    id: 'standard',
    name: 'Standard',
    monthlyPrice: 29000,
    description: '활발하게 운영되는 동아리를 위한 플랜',
    features: [
      '무제한 회원 관리',
      '무제한 공지사항',
      '물품 등록 및 대여 관리',
      '대여 내역 추적',
      '활동 기록 아카이브',
      '가입 신청서 무제한',
      '회원 검색 및 필터링',
    ],
    recommended: true,
    contactOnly: false,
    comingSoon: false,
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 0,
    description: '학교 공식 또는 대규모 단체를 위한 플랜',
    features: [
      'Standard의 모든 기능',
      '다중 동아리 통합 관리',
      '학교/단체 브랜딩 적용',
      '우선 기능 요청',
    ],
    recommended: false,
    contactOnly: true,
    comingSoon: false,
  },
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[SubscriptionPlanId];
