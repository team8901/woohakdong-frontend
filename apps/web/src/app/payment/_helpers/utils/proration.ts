/**
 * 구독 플랜 변경 시 비례 정산(Proration) 계산 유틸리티
 *
 * 업그레이드: 즉시 적용 + 차액 결제
 * 다운그레이드: 다음 결제일부터 적용 (비례 정산 없음)
 */

export type ProrationResult = {
  /** 업그레이드 여부 */
  isUpgrade: boolean;
  /** 현재 플랜 남은 일수 */
  remainingDays: number;
  /** 총 결제 주기 일수 */
  totalDays: number;
  /** 현재 플랜 미사용 크레딧 (환불될 금액) */
  currentPlanCredit: number;
  /** 새 플랜 남은 기간 비용 */
  newPlanCost: number;
  /** 실제 청구 금액 (newPlanCost - currentPlanCredit) */
  amountDue: number;
  /** 다음 결제일 */
  nextBillingDate: Date;
};

type CalculateProrationParams = {
  /** 현재 플랜 월 가격 */
  currentPlanPrice: number;
  /** 새 플랜 월 가격 */
  newPlanPrice: number;
  /** 현재 결제 주기 시작일 */
  billingStartDate: Date;
  /** 현재 결제 주기 종료일 (다음 결제일) */
  billingEndDate: Date;
};

/**
 * 비례 정산 금액 계산
 *
 * @example
 * // Standard $10,000 → Pro $20,000 (15일 사용 후 변경, 30일 주기)
 * calculateProration({
 *   currentPlanPrice: 10000,
 *   newPlanPrice: 20000,
 *   billingStartDate: new Date('2024-01-01'),
 *   billingEndDate: new Date('2024-01-31'),
 * })
 * // 결과 (1월 16일에 변경 시):
 * // - remainingDays: 15
 * // - currentPlanCredit: 5000 (10000 × 15/30)
 * // - newPlanCost: 10000 (20000 × 15/30)
 * // - amountDue: 5000 (10000 - 5000)
 */
export function calculateProration({
  currentPlanPrice,
  newPlanPrice,
  billingStartDate,
  billingEndDate,
}: CalculateProrationParams): ProrationResult {
  const now = new Date();
  const startTime = billingStartDate.getTime();
  const endTime = billingEndDate.getTime();
  const nowTime = now.getTime();

  // 총 결제 주기 일수
  const totalDays = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));

  // 남은 일수 (오늘 포함)
  const remainingDays = Math.max(
    0,
    Math.ceil((endTime - nowTime) / (1000 * 60 * 60 * 24)),
  );

  // 업그레이드 여부
  const isUpgrade = newPlanPrice > currentPlanPrice;

  // 일일 요금
  const currentDailyRate = currentPlanPrice / totalDays;
  const newDailyRate = newPlanPrice / totalDays;

  // 현재 플랜 미사용 크레딧 (남은 기간에 대한 환불)
  const currentPlanCredit = Math.round(currentDailyRate * remainingDays);

  // 새 플랜 남은 기간 비용
  const newPlanCost = Math.round(newDailyRate * remainingDays);

  // 실제 청구 금액
  const amountDue = Math.max(0, newPlanCost - currentPlanCredit);

  return {
    isUpgrade,
    remainingDays,
    totalDays,
    currentPlanCredit,
    newPlanCost,
    amountDue,
    nextBillingDate: billingEndDate,
  };
}

/**
 * 비례 정산 설명 텍스트 생성
 */
export function getProrationDescription(proration: ProrationResult): string {
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
