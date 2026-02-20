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

    console.log(
      `Processing canceled subscription ${subscription.id}: ${subscription.planId} -> ${newPlanId}, price=${newPrice}`,
    );

    if (isTransitioningToPaidPlan) {
      await handlePaidPlanTransition(
        env,
        firebaseToken,
        subscription,
        newPlanId,
        newPlanName,
        newPrice,
      );
    } else {
      await handleFreePlanTransition(
        env,
        firebaseToken,
        subscription,
        newPlanId,
        newPlanName,
      );
    }
  }

  console.log('Canceled subscription expiry process complete');
};

/**
 * 유료 플랜으로 전환 처리 (정기결제만)
 */
const handlePaidPlanTransition = async (
  env: Env,
  firebaseToken: string,
  subscription: Subscription,
  newPlanId: string,
  newPlanName: string,
  newPrice: number,
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

  const paymentId = `plan_change_${subscription.clubId}_${Date.now()}`;
  const orderName = `${newPlanName} 플랜 정기결제`;

  const result = await processBillingPayment(
    env,
    billingKey.billingKey,
    newPrice,
    paymentId,
    orderName,
  );

  if (!result.success) {
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
        amount: newPrice,
        planId: newPlanId,
        planName: newPlanName,
        previousPlanId: subscription.planId,
        previousPlanName: subscription.planName,
        status: 'failed',
        type: 'plan_change',
        errorCode: result.error.code,
        errorMessage: result.error.message,
        createdAt: new Date(),
      },
    );

    return;
  }

  const paymentData = result.data;
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

  const documentId =
    paymentData.paymentId && paymentData.paymentId !== 'undefined'
      ? paymentData.paymentId
      : paymentId;

  await createFirestoreDocument(
    env,
    firebaseToken,
    PAYMENTS_COLLECTION,
    documentId,
    {
      id: documentId,
      subscriptionId: subscription.id,
      clubId: subscription.clubId,
      userId: subscription.userId,
      userEmail: subscription.userEmail,
      orderId: documentId,
      transactionId: paymentData.transactionId || '',
      amount: paymentData.amount,
      planId: newPlanId,
      planName: newPlanName,
      previousPlanId: subscription.planId,
      previousPlanName: subscription.planName,
      status: 'success',
      type: 'plan_change',
      paidAt: paymentData.paidAt,
      createdAt: new Date(),
    },
  );

  console.log(
    `Canceled subscription ${subscription.id} transitioned to paid plan ${newPlanId}`,
  );
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
): Promise<void> => {
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
