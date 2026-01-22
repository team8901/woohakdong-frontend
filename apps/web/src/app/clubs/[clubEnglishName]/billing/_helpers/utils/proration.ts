/**
 * 구독 플랜 변경 시 비례 정산(Proration) 계산 유틸리티
 *
 * 업그레이드: 즉시 적용 + 차액 결제
 * 다운그레이드: 다음 결제일부터 적용 (비례 정산 없음)
 *
 * 빌링 주기 변경 시:
 * - 현재 구독의 남은 크레딧 계산
 * - 새 구독 첫 결제에서 크레딧 차감
 * - 새로운 빌링 주기로 시작
 */

export type BillingCycle = 'monthly' | 'yearly';

export type ProrationResult = {
  /** 업그레이드 여부 (가격 기준) */
  isUpgrade: boolean;
  /** 빌링 주기 변경 여부 */
  isBillingCycleChange: boolean;
  /** 현재 플랜 남은 일수 */
  remainingDays: number;
  /** 총 결제 주기 일수 */
  totalDays: number;
  /** 현재 플랜 미사용 크레딧 (남은 기간에 대한 환불) */
  currentPlanCredit: number;
  /** 기존에 보유한 크레딧 (이전 플랜 변경에서 남은 금액) */
  existingCredit: number;
  /** 총 크레딧 (currentPlanCredit + existingCredit) */
  totalCredit: number;
  /** 새 플랜 첫 결제 비용 */
  newPlanCost: number;
  /** 실제 청구 금액 (newPlanCost - totalCredit, 최소 0) */
  amountDue: number;
  /** 남은 크레딧 (새 플랜 비용보다 크레딧이 많을 경우) */
  remainingCredit: number;
  /** 다음 결제일 */
  nextBillingDate: Date;
};

type CalculateProrationParams = {
  /** 현재 구독에서 실제 결제한 금액 */
  currentPlanPrice: number;
  /** 현재 빌링 주기 */
  currentBillingCycle: BillingCycle;
  /** 새 플랜 가격 (월간이면 월 가격, 연간이면 연 가격) */
  newPlanPrice: number;
  /** 새 빌링 주기 */
  newBillingCycle: BillingCycle;
  /** 현재 결제 주기 시작일 */
  billingStartDate: Date;
  /** 현재 결제 주기 종료일 (다음 결제일) */
  billingEndDate: Date;
  /** 기존에 보유한 크레딧 (이전 플랜 변경에서 남은 금액) */
  existingCredit?: number;
};

/**
 * 비례 정산 금액 계산
 *
 * @example
 * // 같은 빌링 주기: Standard 월간 29,000 → Pro 월간 49,000 (15일 사용 후 변경)
 * calculateProration({
 *   currentPlanPrice: 29000,
 *   currentBillingCycle: 'monthly',
 *   newPlanPrice: 49000,
 *   newBillingCycle: 'monthly',
 *   billingStartDate: new Date('2024-01-01'),
 *   billingEndDate: new Date('2024-01-31'),
 * })
 * // 결과: amountDue = (49000 - 29000) × 15/30 = 10,000원
 *
 * @example
 * // 빌링 주기 변경: Standard 연간 288,000 → Pro 월간 49,000 (3개월 사용 후)
 * calculateProration({
 *   currentPlanPrice: 288000,
 *   currentBillingCycle: 'yearly',
 *   newPlanPrice: 49000,
 *   newBillingCycle: 'monthly',
 *   billingStartDate: new Date('2024-01-01'),
 *   billingEndDate: new Date('2025-01-01'),
 * })
 * // 결과: 크레딧 = 288000 × 275/365 ≈ 217,000원
 * //       첫 월 비용 = 49,000원
 * //       amountDue = 0원, remainingCredit = 168,000원
 */
export function calculateProration({
  currentPlanPrice,
  currentBillingCycle,
  newPlanPrice,
  newBillingCycle,
  billingStartDate,
  billingEndDate,
  existingCredit = 0,
}: CalculateProrationParams): ProrationResult {
  const now = new Date();
  const startTime = billingStartDate.getTime();
  const endTime = billingEndDate.getTime();
  const nowTime = now.getTime();

  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  // 일수 계산 (일 단위로 안정적인 계산)
  const totalPeriodMs = endTime - startTime;
  const totalDays = Math.max(1, Math.ceil(totalPeriodMs / MS_PER_DAY));

  // 사용한 일수 (floor: 당일은 0일로 계산)
  const usedMs = Math.max(0, nowTime - startTime);
  const usedDays = Math.floor(usedMs / MS_PER_DAY);

  // 남은 일수 (당일 변경이면 전체 일수)
  const remainingDays = Math.max(0, totalDays - usedDays);

  // 빌링 주기 변경 여부
  const isBillingCycleChange = currentBillingCycle !== newBillingCycle;

  // 남은 비율 계산 (일 단위)
  // 당일 변경(usedDays === 0)이면 전액 크레딧
  let remainingRatio: number;

  if (totalDays <= 0) {
    // 비정상 케이스
    remainingRatio = 1;
  } else if (usedDays === 0) {
    // 당일 변경: 전액 크레딧
    remainingRatio = 1;
  } else if (remainingDays <= 0) {
    // endDate가 지났지만 active 구독인 경우 (스케줄러 지연 등)
    // 최소 10% 보장
    remainingRatio = 0.1;
  } else {
    remainingRatio = remainingDays / totalDays;
  }

  // 현재 플랜 미사용 크레딧 (남은 비율에 대한 환불)
  const currentPlanCredit = Math.round(currentPlanPrice * remainingRatio);

  let newPlanCost: number;
  let nextBillingDate: Date;

  if (isBillingCycleChange) {
    // 빌링 주기 변경: 새 주기의 첫 결제 비용 (전체 금액)
    newPlanCost = newPlanPrice;
    nextBillingDate = new Date();

    if (newBillingCycle === 'yearly') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }
  } else {
    // 같은 빌링 주기: 남은 비율에 대한 비례 정산
    newPlanCost = Math.round(newPlanPrice * remainingRatio);
    nextBillingDate = billingEndDate;
  }

  // 총 크레딧 (현재 플랜 미사용 + 기존 보유 크레딧)
  const totalCredit = currentPlanCredit + existingCredit;

  // 실제 청구 금액 (크레딧으로 상쇄)
  const amountDue = Math.max(0, newPlanCost - totalCredit);

  // 남은 크레딧 (새 플랜 비용보다 크레딧이 많은 경우)
  const remainingCredit = Math.max(0, totalCredit - newPlanCost);

  // 업그레이드 여부: 월 단위로 환산하여 비교
  const currentMonthlyEquivalent =
    currentBillingCycle === 'yearly'
      ? currentPlanPrice / 12
      : currentPlanPrice;
  const newMonthlyEquivalent =
    newBillingCycle === 'yearly' ? newPlanPrice / 12 : newPlanPrice;
  const isUpgrade = newMonthlyEquivalent > currentMonthlyEquivalent;

  return {
    isUpgrade,
    isBillingCycleChange,
    remainingDays,
    totalDays,
    currentPlanCredit,
    existingCredit,
    totalCredit,
    newPlanCost,
    amountDue,
    remainingCredit,
    nextBillingDate,
  };
}

/**
 * 비례 정산 설명 텍스트 생성
 */
export function getProrationDescription(proration: ProrationResult): string {
  if (proration.isBillingCycleChange) {
    if (proration.amountDue === 0 && proration.remainingCredit > 0) {
      return `총 ${proration.totalCredit.toLocaleString()}원 크레딧이 적용됩니다. 남은 ${proration.remainingCredit.toLocaleString()}원은 다음 결제에서 차감됩니다.`;
    }

    if (proration.amountDue === 0) {
      return '보유 크레딧으로 첫 결제가 충당됩니다.';
    }

    return `총 ${proration.totalCredit.toLocaleString()}원 크레딧 적용 후 ${proration.amountDue.toLocaleString()}원이 청구됩니다.`;
  }

  if (proration.amountDue === 0) {
    return '추가 결제 없이 플랜이 변경됩니다.';
  }

  return `남은 ${proration.remainingDays}일에 대해 ${proration.amountDue.toLocaleString()}원이 청구됩니다.`;
}

/**
 * 무료 플랜에서 유료 플랜으로 변경 시 (비례 정산 없음, 전액 결제)
 */
export function calculateFirstSubscription(monthlyPrice: number): {
  amountDue: number;
  nextBillingDate: Date;
} {
  const nextBillingDate = new Date();

  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  return {
    amountDue: monthlyPrice,
    nextBillingDate,
  };
}
