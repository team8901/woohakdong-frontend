/**
 * 취소 예정 구독 만료 처리
 */

import {
  createFirestoreDocument,
  getFirebaseAccessToken,
  queryFirestore,
  updateFirestoreDocument,
} from './firebase';
import { getDefaultBillingKey, processBillingPayment } from './portone';
import type { Env, Subscription } from './types';
import { PAYMENTS_COLLECTION, SUBSCRIPTIONS_COLLECTION } from './types';
import { calculateNewEndDate } from './utils';

/**
 * 취소 예정 구독 만료 처리 (매일 오전 9시 KST)
 */
export const processCanceledSubscriptions = async (env: Env): Promise<void> => {
  console.log('Starting canceled subscription expiry process...');

  const firebaseToken = await getFirebaseAccessToken(env);
  const now = new Date();

  const subscriptions = (await queryFirestore(
    env,
    firebaseToken,
    SUBSCRIPTIONS_COLLECTION,
    [
      { field: 'status', op: 'EQUAL', value: 'active' },
      { field: 'endDate', op: 'LESS_THAN_OR_EQUAL', value: now },
    ],
  )) as Subscription[];

  const canceledSubscriptions = subscriptions.filter(
    (sub) => sub.canceledAt != null,
  );

  console.log(
    `Found ${canceledSubscriptions.length} canceled subscriptions to expire`,
  );

  for (const subscription of canceledSubscriptions) {
    if (!subscription.id || !subscription.clubId) {
      console.error(
        `Invalid subscription data: id=${subscription.id}, clubId=${subscription.clubId}`,
      );

      continue;
    }

    const newPlanId = subscription.nextPlanId ?? 'FREE';
    const newPlanName = subscription.nextPlanName ?? 'Free';
    const newPrice = subscription.nextPlanPrice ?? 0;
    const isTransitioningToPaidPlan = newPrice > 0;
    const existingCredit = subscription.credit ?? 0;

    console.log(
      `Processing canceled subscription ${subscription.id}: ${subscription.planId} -> ${newPlanId}, price=${newPrice}, credit=${existingCredit}`,
    );

    if (isTransitioningToPaidPlan) {
      await handlePaidPlanTransition(
        env,
        firebaseToken,
        subscription,
        newPlanId,
        newPlanName,
        newPrice,
        existingCredit,
      );
    } else {
      await handleFreePlanTransition(
        env,
        firebaseToken,
        subscription,
        newPlanId,
        newPlanName,
        existingCredit,
      );
    }
  }

  console.log('Canceled subscription expiry process complete');
};

/**
 * 유료 플랜으로 전환 처리
 */
const handlePaidPlanTransition = async (
  env: Env,
  firebaseToken: string,
  subscription: Subscription,
  newPlanId: string,
  newPlanName: string,
  newPrice: number,
  existingCredit: number,
): Promise<void> => {
  const billingKey = await getDefaultBillingKey(
    env,
    firebaseToken,
    subscription.clubId,
  );

  if (!billingKey) {
    console.error(
      `Default billing key not found for club: ${subscription.clubId}, transitioning to free instead`,
    );

    await updateFirestoreDocument(
      env,
      firebaseToken,
      SUBSCRIPTIONS_COLLECTION,
      subscription.id,
      {
        planId: 'FREE',
        planName: 'Free',
        price: 0,
        status: 'active',
        canceledAt: null,
        credit: null,
        endDate: null,
        billingCycle: null,
        nextPlanId: null,
        nextPlanName: null,
        nextPlanPrice: null,
        lastPaymentError: '등록된 기본 결제수단을 찾을 수 없습니다.',
        updatedAt: new Date(),
      },
    );

    return;
  }

  const actualPaymentAmount = Math.max(0, newPrice - existingCredit);
  const remainingCredit = Math.max(0, existingCredit - newPrice);
  const creditApplied = Math.min(existingCredit, newPrice);

  const paymentId = `plan_change_${subscription.clubId}_${Date.now()}`;
  const orderName =
    existingCredit > 0
      ? `${newPlanName} 플랜 정기결제 (크레딧 ${creditApplied.toLocaleString()}원 적용)`
      : `${newPlanName} 플랜 정기결제`;

  let paymentSuccess = false;
  let paymentData: {
    paymentId: string;
    transactionId: string;
    amount: number;
    paidAt: string;
  } | null = null;

  if (actualPaymentAmount > 0) {
    const result = await processBillingPayment(
      env,
      billingKey.billingKey,
      actualPaymentAmount,
      paymentId,
      orderName,
    );

    paymentSuccess = result.success;

    if (result.success) {
      paymentData = result.data;
      console.log(
        `Payment successful for plan change: ${subscription.id}, amount=${actualPaymentAmount}`,
      );
    } else {
      console.error(
        `Payment failed for plan change ${subscription.id}: ${result.error.message}`,
      );

      await updateFirestoreDocument(
        env,
        firebaseToken,
        SUBSCRIPTIONS_COLLECTION,
        subscription.id,
        {
          planId: 'FREE',
          planName: 'Free',
          price: 0,
          status: 'active',
          canceledAt: null,
          credit: existingCredit > 0 ? existingCredit : null,
          endDate: null,
          billingCycle: null,
          nextPlanId: null,
          nextPlanName: null,
          nextPlanPrice: null,
          lastPaymentError: result.error.message,
          updatedAt: new Date(),
        },
      );

      const failedPaymentId = `failed_plan_change_${subscription.clubId}_${Date.now()}`;

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
          planId: newPlanId,
          planName: newPlanName,
          previousPlanId: subscription.planId,
          previousPlanName: subscription.planName,
          status: 'failed',
          type: 'plan_change',
          errorCode: result.error.code,
          errorMessage: result.error.message,
          creditApplied: creditApplied > 0 ? creditApplied : null,
          createdAt: new Date(),
        },
      );

      return;
    }
  } else {
    paymentSuccess = true;
    console.log(
      `Plan change ${subscription.id} covered by credit (no payment needed)`,
    );
  }

  if (paymentSuccess) {
    const newEndDate = calculateNewEndDate(
      new Date(),
      subscription.billingCycle,
      env,
    );

    await updateFirestoreDocument(
      env,
      firebaseToken,
      SUBSCRIPTIONS_COLLECTION,
      subscription.id,
      {
        planId: newPlanId,
        planName: newPlanName,
        price: newPrice,
        status: 'active',
        canceledAt: null,
        credit: remainingCredit > 0 ? remainingCredit : null,
        startDate: new Date(),
        endDate: newEndDate,
        nextPlanId: null,
        nextPlanName: null,
        nextPlanPrice: null,
        retryCount: 0,
        lastPaymentError: null,
        updatedAt: new Date(),
      },
    );

    const documentId = paymentData
      ? paymentData.paymentId && paymentData.paymentId !== 'undefined'
        ? paymentData.paymentId
        : paymentId
      : `credit_${subscription.clubId}_${Date.now()}`;

    const paymentRecord: Record<string, unknown> = {
      id: documentId,
      subscriptionId: subscription.id,
      clubId: subscription.clubId,
      userId: subscription.userId,
      userEmail: subscription.userEmail,
      orderId: documentId,
      transactionId: paymentData?.transactionId || '',
      amount: paymentData?.amount ?? 0,
      planId: newPlanId,
      planName: newPlanName,
      previousPlanId: subscription.planId,
      previousPlanName: subscription.planName,
      status: 'success',
      type: 'plan_change',
      createdAt: new Date(),
    };

    if (creditApplied > 0) {
      paymentRecord.creditApplied = creditApplied;
    }

    if (paymentData?.paidAt) {
      paymentRecord.paidAt = paymentData.paidAt;
    }

    await createFirestoreDocument(
      env,
      firebaseToken,
      PAYMENTS_COLLECTION,
      documentId,
      paymentRecord,
    );

    console.log(
      `Canceled subscription ${subscription.id} transitioned to paid plan ${newPlanId}`,
    );
  }
};

/**
 * 무료 플랜으로 전환 처리
 */
const handleFreePlanTransition = async (
  env: Env,
  firebaseToken: string,
  subscription: Subscription,
  newPlanId: string,
  newPlanName: string,
  existingCredit: number,
): Promise<void> => {
  if (existingCredit > 0) {
    console.log(
      `Subscription ${subscription.id} had ${existingCredit} credit forfeited on cancellation to free`,
    );
  }

  await updateFirestoreDocument(
    env,
    firebaseToken,
    SUBSCRIPTIONS_COLLECTION,
    subscription.id,
    {
      planId: newPlanId,
      planName: newPlanName,
      price: 0,
      status: 'active',
      canceledAt: null,
      credit: null,
      endDate: null,
      billingCycle: null,
      nextPlanId: null,
      nextPlanName: null,
      nextPlanPrice: null,
      updatedAt: new Date(),
    },
  );

  const historyId = `cancel_${subscription.clubId}_${Date.now()}`;

  await createFirestoreDocument(
    env,
    firebaseToken,
    PAYMENTS_COLLECTION,
    historyId,
    {
      id: historyId,
      subscriptionId: subscription.id,
      clubId: subscription.clubId,
      userId: subscription.userId,
      userEmail: subscription.userEmail,
      orderId: historyId,
      transactionId: '',
      amount: 0,
      planId: newPlanId,
      planName: newPlanName,
      previousPlanId: subscription.planId,
      previousPlanName: subscription.planName,
      status: 'success',
      type: 'subscription_canceled',
      createdAt: new Date(),
    },
  );

  console.log(
    `Canceled subscription ${subscription.id} transitioned to free plan`,
  );
};
