/**
 * 구독 갱신 및 결제 재시도 처리
 */

import {
  createFirestoreDocument,
  getFirebaseAccessToken,
  queryFirestore,
  updateFirestoreDocument,
} from './firebase';
import { getDefaultBillingKey, processBillingPayment } from './portone';
import type { Env, Subscription } from './types';
import { MAX_RETRY_COUNT, PAYMENTS_COLLECTION, SUBSCRIPTIONS_COLLECTION } from './types';
import { calculateNewEndDate } from './utils';

/**
 * 단일 구독 갱신 결제 처리
 */
export const renewSubscription = async (
  env: Env,
  firebaseToken: string,
  subscription: Subscription,
): Promise<boolean> => {
  // 필수 필드 검증
  if (!subscription.id || !subscription.clubId) {
    console.error(
      `renewSubscription: Invalid subscription data - id=${subscription.id}, clubId=${subscription.clubId}`,
    );

    return false;
  }

  // 동아리의 기본 결제수단 조회
  const billingKey = await getDefaultBillingKey(
    env,
    firebaseToken,
    subscription.clubId,
  );

  if (!billingKey) {
    console.error(
      `Default billing key not found for club: ${subscription.clubId}`,
    );

    await updateFirestoreDocument(
      env,
      firebaseToken,
      SUBSCRIPTIONS_COLLECTION,
      subscription.id,
      {
        status: 'payment_failed',
        lastPaymentError: '등록된 기본 결제수단을 찾을 수 없습니다.',
        updatedAt: new Date(),
      },
    );

    return false;
  }

  // 예약된 플랜 변경이 있으면 새 플랜 가격으로 결제
  const hasScheduledChange = !!subscription.nextPlanId;
  const effectivePlanId = hasScheduledChange
    ? subscription.nextPlanId
    : subscription.planId;
  const effectivePlanName = hasScheduledChange
    ? (subscription.nextPlanName ?? subscription.nextPlanId)
    : subscription.planName;
  const effectivePrice = hasScheduledChange
    ? (subscription.nextPlanPrice ?? subscription.price)
    : subscription.price;

  // 결제 시도
  const paymentId = `renewal_${subscription.clubId}_${Date.now()}`;
  const orderName = hasScheduledChange
    ? `${effectivePlanName} 플랜 정기결제 (플랜 변경)`
    : `${effectivePlanName} 플랜 정기결제`;

  // 크레딧이 있으면 결제 금액에서 차감
  const existingCredit = subscription.credit ?? 0;
  const actualPaymentAmount = Math.max(0, effectivePrice - existingCredit);
  const remainingCredit = Math.max(0, existingCredit - effectivePrice);

  let paymentSuccess = false;
  let paymentData: {
    paymentId: string;
    transactionId: string;
    amount: number;
    paidAt: string;
  } | null = null;

  // 결제 금액이 0보다 크면 실제 결제 진행
  if (actualPaymentAmount > 0) {
    const result = await processBillingPayment(
      env,
      billingKey.billingKey,
      actualPaymentAmount,
      paymentId,
      existingCredit > 0
        ? `${orderName} (크레딧 ${existingCredit.toLocaleString()}원 적용)`
        : orderName,
    );

    paymentSuccess = result.success;

    if (result.success) {
      paymentData = result.data;
    } else {
      // 결제 실패 처리
      const currentRetryCount = subscription.retryCount ?? 0;
      const newRetryCount = currentRetryCount + 1;

      if (newRetryCount >= MAX_RETRY_COUNT) {
        await updateFirestoreDocument(
          env,
          firebaseToken,
          SUBSCRIPTIONS_COLLECTION,
          subscription.id,
          {
            status: 'expired',
            retryCount: newRetryCount,
            lastPaymentError: result.error.message,
            updatedAt: new Date(),
          },
        );

        console.error(
          `Subscription expired after ${MAX_RETRY_COUNT} retries: ${subscription.id}`,
        );
      } else {
        await updateFirestoreDocument(
          env,
          firebaseToken,
          SUBSCRIPTIONS_COLLECTION,
          subscription.id,
          {
            status: 'payment_failed',
            retryCount: newRetryCount,
            lastPaymentError: result.error.message,
            updatedAt: new Date(),
          },
        );

        console.warn(
          `Payment failed for ${subscription.id}, retry ${newRetryCount}/${MAX_RETRY_COUNT}`,
        );
      }

      // 실패한 결제 기록
      const failedPaymentId = `failed_${subscription.clubId}_${Date.now()}`;

      await createFirestoreDocument(
        env,
        firebaseToken,
        PAYMENTS_COLLECTION,
        failedPaymentId,
        {
          id: failedPaymentId,
          subscriptionId: subscription.id,
          clubId: subscription.clubId,
          userId: subscription.userId,
          userEmail: subscription.userEmail,
          orderId: paymentId,
          transactionId: '',
          amount: actualPaymentAmount,
          planId: effectivePlanId,
          planName: effectivePlanName,
          status: 'failed',
          errorCode: result.error.code,
          errorMessage: result.error.message,
          createdAt: new Date(),
        },
      );

      return false;
    }
  } else {
    // 크레딧으로 전액 충당 - 결제 없이 성공 처리
    paymentSuccess = true;

    console.log(
      `Subscription ${subscription.id} renewed with credit (no payment needed)`,
    );
  }

  if (paymentSuccess) {
    // 무료 플랜으로 다운그레이드하는 경우
    const isDowngradingToFree = hasScheduledChange && effectivePrice === 0;

    // 구독 업데이트 데이터
    const updateData: Record<string, unknown> = {
      retryCount: 0,
      lastPaymentError: null,
      updatedAt: new Date(),
    };

    if (isDowngradingToFree) {
      // 무료 플랜: endDate 없음, 크레딧 소멸
      updateData.endDate = null;
      updateData.credit = null;
      updateData.billingCycle = null;
      updateData.planId = effectivePlanId;
      updateData.planName = effectivePlanName;
      updateData.price = 0;
      updateData.nextPlanId = null;
      updateData.nextPlanName = null;
      updateData.nextPlanPrice = null;

      console.log(
        `Downgrading to free plan for ${subscription.id}: ${subscription.planId} -> ${effectivePlanId}`,
      );
    } else {
      // 유료 플랜: 구독 기간 연장
      const currentEndDate = subscription.endDate;
      const newEndDate = calculateNewEndDate(
        currentEndDate,
        subscription.billingCycle,
        env,
      );

      updateData.endDate = newEndDate;
      updateData.credit = remainingCredit > 0 ? remainingCredit : null;

      if (hasScheduledChange) {
        updateData.planId = effectivePlanId;
        updateData.planName = effectivePlanName;
        updateData.price = effectivePrice;
        updateData.nextPlanId = null;
        updateData.nextPlanName = null;
        updateData.nextPlanPrice = null;

        console.log(
          `Applying scheduled plan change for ${subscription.id}: ${subscription.planId} -> ${effectivePlanId}`,
        );
      }
    }

    await updateFirestoreDocument(
      env,
      firebaseToken,
      SUBSCRIPTIONS_COLLECTION,
      subscription.id,
      updateData,
    );

    // 결제 기록 생성
    console.log(
      `Creating payment record for ${subscription.id}: paymentData=${!!paymentData}, isDowngradingToFree=${isDowngradingToFree}, existingCredit=${existingCredit}`,
    );

    let paymentRecordCreated = false;

    if (paymentData) {
      const documentId =
        paymentData.paymentId && paymentData.paymentId !== 'undefined'
          ? paymentData.paymentId
          : `payment_${subscription.clubId}_${Date.now()}`;

      const paymentRecord: Record<string, unknown> = {
        id: documentId,
        subscriptionId: subscription.id,
        clubId: subscription.clubId,
        userId: subscription.userId,
        userEmail: subscription.userEmail,
        orderId: documentId,
        transactionId: paymentData.transactionId || `txn_${documentId}`,
        amount: paymentData.amount,
        planId: effectivePlanId,
        planName: effectivePlanName,
        status: 'success',
        type: hasScheduledChange ? 'plan_change' : 'renewal',
        paidAt: paymentData.paidAt,
        createdAt: new Date(),
      };

      if (existingCredit > 0) {
        paymentRecord.creditApplied = existingCredit;
      }

      if (hasScheduledChange) {
        paymentRecord.previousPlanId = subscription.planId;
        paymentRecord.previousPlanName = subscription.planName;
      }

      try {
        await createFirestoreDocument(
          env,
          firebaseToken,
          PAYMENTS_COLLECTION,
          documentId,
          paymentRecord,
        );
        console.log(`Payment record created successfully: ${documentId}`);
        paymentRecordCreated = true;
      } catch (recordError) {
        console.error(
          `Failed to create payment record: ${documentId}`,
          recordError,
        );
      }
    } else if (isDowngradingToFree) {
      const downgradeId = `downgrade_${subscription.clubId}_${Date.now()}`;

      try {
        await createFirestoreDocument(
          env,
          firebaseToken,
          PAYMENTS_COLLECTION,
          downgradeId,
          {
            id: downgradeId,
            subscriptionId: subscription.id,
            clubId: subscription.clubId,
            userId: subscription.userId,
            userEmail: subscription.userEmail,
            orderId: downgradeId,
            transactionId: '',
            amount: 0,
            planId: effectivePlanId,
            planName: effectivePlanName,
            previousPlanId: subscription.planId,
            previousPlanName: subscription.planName,
            status: 'success',
            type: 'downgrade_to_free',
            createdAt: new Date(),
          },
        );
        console.log(`Downgrade record created successfully: ${downgradeId}`);
        paymentRecordCreated = true;
      } catch (recordError) {
        console.error(
          `Failed to create downgrade record: ${downgradeId}`,
          recordError,
        );
      }
    } else if (existingCredit > 0) {
      const creditPaymentId = `credit_${subscription.clubId}_${Date.now()}`;

      const creditRecord: Record<string, unknown> = {
        id: creditPaymentId,
        subscriptionId: subscription.id,
        clubId: subscription.clubId,
        userId: subscription.userId,
        userEmail: subscription.userEmail,
        orderId: creditPaymentId,
        transactionId: '',
        amount: 0,
        creditApplied: existingCredit,
        planId: effectivePlanId,
        planName: effectivePlanName,
        status: 'success',
        type: hasScheduledChange ? 'plan_change' : 'credit_applied',
        createdAt: new Date(),
      };

      if (hasScheduledChange) {
        creditRecord.previousPlanId = subscription.planId;
        creditRecord.previousPlanName = subscription.planName;
      }

      try {
        await createFirestoreDocument(
          env,
          firebaseToken,
          PAYMENTS_COLLECTION,
          creditPaymentId,
          creditRecord,
        );
        console.log(`Credit record created successfully: ${creditPaymentId}`);
        paymentRecordCreated = true;
      } catch (recordError) {
        console.error(
          `Failed to create credit record: ${creditPaymentId}`,
          recordError,
        );
      }
    }

    // Catch-all fallback
    if (!paymentRecordCreated) {
      console.warn(
        `No payment record created for ${subscription.id}, creating fallback record`,
      );

      const fallbackId = `renewal_fallback_${subscription.clubId}_${Date.now()}`;

      const fallbackRecord: Record<string, unknown> = {
        id: fallbackId,
        subscriptionId: subscription.id,
        clubId: subscription.clubId,
        userId: subscription.userId,
        userEmail: subscription.userEmail,
        orderId: fallbackId,
        transactionId: '',
        amount: actualPaymentAmount,
        planId: effectivePlanId,
        planName: effectivePlanName,
        status: 'success',
        type: hasScheduledChange ? 'plan_change' : 'renewal',
        createdAt: new Date(),
      };

      if (hasScheduledChange) {
        fallbackRecord.previousPlanId = subscription.planId;
        fallbackRecord.previousPlanName = subscription.planName;
      }

      try {
        await createFirestoreDocument(
          env,
          firebaseToken,
          PAYMENTS_COLLECTION,
          fallbackId,
          fallbackRecord,
        );
        console.log(`Fallback record created: ${fallbackId}`);
      } catch (recordError) {
        console.error(
          `Failed to create fallback record: ${fallbackId}`,
          recordError,
        );
      }
    }

    console.log(
      `Subscription ${isDowngradingToFree ? 'downgraded to free' : 'renewed'}: ${subscription.id}`,
    );

    return true;
  }

  return false;
};

/**
 * 정기결제 갱신 처리 (매일 오전 9시 KST)
 */
export const processSubscriptionRenewals = async (env: Env): Promise<void> => {
  console.log('Starting subscription renewal process...');

  const firebaseToken = await getFirebaseAccessToken(env);
  const now = new Date();

  console.log(`Current time: ${now.toISOString()}`);

  const subscriptions = (await queryFirestore(
    env,
    firebaseToken,
    SUBSCRIPTIONS_COLLECTION,
    [
      { field: 'status', op: 'EQUAL', value: 'active' },
      { field: 'endDate', op: 'LESS_THAN_OR_EQUAL', value: now },
    ],
  )) as Subscription[];

  console.log(`Found ${subscriptions.length} subscriptions to renew`);

  let success = 0;
  let failed = 0;

  for (const subscription of subscriptions) {
    if (!subscription.id || !subscription.clubId) {
      console.error(
        `Invalid subscription data: id=${subscription.id}, clubId=${subscription.clubId}`,
      );

      continue;
    }

    if (subscription.price === 0) {
      console.log(`Skipping free plan: ${subscription.id}`);

      continue;
    }

    // 취소된 구독은 processCanceledSubscriptions에서 처리
    if (subscription.canceledAt) {
      console.log(`Skipping canceled subscription: ${subscription.id}`);

      continue;
    }

    const result = await renewSubscription(env, firebaseToken, subscription);

    if (result) success++;
    else failed++;
  }

  console.log(
    `Subscription renewal complete: ${success} success, ${failed} failed`,
  );
};

/**
 * 결제 실패 재시도 (매일 오후 2시 KST)
 */
export const retryFailedPayments = async (env: Env): Promise<void> => {
  console.log('Starting failed payment retry process...');

  const firebaseToken = await getFirebaseAccessToken(env);

  const subscriptions = (await queryFirestore(
    env,
    firebaseToken,
    SUBSCRIPTIONS_COLLECTION,
    [
      { field: 'status', op: 'EQUAL', value: 'payment_failed' },
      { field: 'retryCount', op: 'LESS_THAN', value: MAX_RETRY_COUNT },
    ],
  )) as Subscription[];

  console.log(`Found ${subscriptions.length} failed subscriptions to retry`);

  let success = 0;
  let failed = 0;

  for (const subscription of subscriptions) {
    if (!subscription.id || !subscription.clubId) {
      console.error(
        `Invalid subscription data: id=${subscription.id}, clubId=${subscription.clubId}`,
      );

      continue;
    }

    const result = await renewSubscription(env, firebaseToken, subscription);

    if (result) {
      await updateFirestoreDocument(
        env,
        firebaseToken,
        SUBSCRIPTIONS_COLLECTION,
        subscription.id,
        {
          status: 'active',
          updatedAt: new Date(),
        },
      );
      success++;
    } else {
      failed++;
    }
  }

  console.log(
    `Failed payment retry complete: ${success} success, ${failed} failed`,
  );
};
