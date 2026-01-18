/**
 * 유틸리티 함수
 */

import type { BillingCycle, Env } from './types';

/**
 * 테스트 빌링 주기 (분) 가져오기
 */
export const getTestBillingCycleMinutes = (env: Env): number | null => {
  const envValue = env.TEST_BILLING_CYCLE_MINUTES;

  if (!envValue) return null;

  const minutes = parseInt(envValue, 10);

  return isNaN(minutes) ? null : minutes;
};

/**
 * 구독 종료일 계산 (갱신용)
 */
export const calculateNewEndDate = (
  currentEndDate: Date,
  billingCycle: BillingCycle,
  env: Env,
): Date => {
  const now = new Date();
  const baseDate = new Date(Math.max(now.getTime(), currentEndDate.getTime()));
  const newEndDate = new Date(baseDate);
  const testCycleMinutes = getTestBillingCycleMinutes(env);

  if (testCycleMinutes !== null) {
    newEndDate.setTime(newEndDate.getTime() + testCycleMinutes * 60 * 1000);
  } else if (billingCycle === 'yearly') {
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
  } else {
    newEndDate.setMonth(newEndDate.getMonth() + 1);
  }

  return newEndDate;
};
