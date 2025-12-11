/**
 * Firebase Functions - 정기결제 스케줄러
 *
 * TODO: Firebase Blaze 플랜 업그레이드 필요
 * - Firebase Functions 배포에는 Blaze(종량제) 플랜이 필요함
 * - 대안 검토:
 *   1. Vercel Cron Jobs (무료 티어: 일 1회 실행)
 *   2. GitHub Actions scheduled workflows (무료)
 *   3. Railway, Render 등 무료 티어 제공 서비스
 *   4. Google Cloud Scheduler + Cloud Run (무료 티어 있음)
 * - Blaze 플랜 업그레이드 후 `pnpm functions:deploy`로 배포
 */

import * as admin from 'firebase-admin';
import { defineString } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/v2/scheduler';

admin.initializeApp();

const db = admin.firestore();

// 환경 변수
const tossPaymentsSecretKey = defineString('TOSS_PAYMENTS_SECRET_KEY');

// 상수
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const PAYMENTS_COLLECTION = 'payments';
const BILLING_KEYS_COLLECTION = 'billingKeys';
const MAX_RETRY_COUNT = 3;

type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'expired'
  | 'pending'
  | 'payment_failed';

interface Subscription {
  id: string;
  clubId: number;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  price: number;
  billingKeyId: string;
  status: SubscriptionStatus;
  startDate: admin.firestore.Timestamp;
  endDate: admin.firestore.Timestamp;
  retryCount?: number;
  lastPaymentError?: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

interface BillingKey {
  id: string;
  clubId: number;
  billingKey: string;
  customerKey: string;
  cardCompany: string;
  cardNumber: string;
  isDefault: boolean;
}

interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  approvedAt: string;
  totalAmount: number;
}

interface TossPaymentError {
  code: string;
  message: string;
}

/**
 * 토스페이먼츠 빌링키 결제 API 호출
 */
async function processBillingPayment(
  billingKey: string,
  customerKey: string,
  amount: number,
  orderId: string,
  orderName: string,
): Promise<
  | { success: true; data: TossPaymentResponse }
  | { success: false; error: TossPaymentError }
> {
  const secretKey = tossPaymentsSecretKey.value();

  if (!secretKey) {
    return {
      success: false,
      error: {
        code: 'CONFIG_ERROR',
        message: '결제 시스템 설정이 완료되지 않았습니다.',
      },
    };
  }

  const credentials = Buffer.from(`${secretKey}:`).toString('base64');

  try {
    const response = await fetch(
      `https://api.tosspayments.com/v1/billing/${billingKey}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerKey,
          amount,
          orderId,
          orderName,
        }),
      },
    );

    if (!response.ok) {
      const errorData = (await response.json()) as TossPaymentError;

      console.error('TossPayments billing payment failed:', errorData);

      return { success: false, error: errorData };
    }

    const data = (await response.json()) as TossPaymentResponse;

    return { success: true, data };
  } catch (error) {
    console.error('TossPayments API error:', error);

    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: '결제 서버 연결에 실패했습니다.',
      },
    };
  }
}

/**
 * 구독 갱신 결제 처리
 */
async function renewSubscription(subscription: Subscription): Promise<boolean> {
  // 빌링키 조회
  const billingKeyDoc = await db
    .collection(BILLING_KEYS_COLLECTION)
    .doc(subscription.billingKeyId)
    .get();

  if (!billingKeyDoc.exists) {
    console.error(`Billing key not found: ${subscription.billingKeyId}`);

    await db
      .collection(SUBSCRIPTIONS_COLLECTION)
      .doc(subscription.id)
      .update({
        status: 'payment_failed' as SubscriptionStatus,
        lastPaymentError: '등록된 카드 정보를 찾을 수 없습니다.',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return false;
  }

  const billingKey = billingKeyDoc.data() as BillingKey;

  // 빌링키가 비어있으면 (삭제된 카드)
  if (!billingKey.billingKey) {
    console.error(
      `Billing key is empty (deleted card): ${subscription.billingKeyId}`,
    );

    await db
      .collection(SUBSCRIPTIONS_COLLECTION)
      .doc(subscription.id)
      .update({
        status: 'payment_failed' as SubscriptionStatus,
        lastPaymentError: '삭제된 카드입니다. 새 카드를 등록해주세요.',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return false;
  }

  // 결제 시도
  const orderId = `renewal_${subscription.clubId}_${Date.now()}`;
  const orderName = `${subscription.planName} 플랜 정기결제`;

  const result = await processBillingPayment(
    billingKey.billingKey,
    billingKey.customerKey,
    subscription.price,
    orderId,
    orderName,
  );

  if (result.success) {
    // 결제 성공: 구독 기간 연장 및 결제 기록 생성
    const newEndDate = new Date(subscription.endDate.toDate());

    newEndDate.setMonth(newEndDate.getMonth() + 1);

    await db.collection(SUBSCRIPTIONS_COLLECTION).doc(subscription.id).update({
      endDate: newEndDate,
      retryCount: 0,
      lastPaymentError: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 결제 기록 생성
    const paymentId = `pay_${Date.now()}_${orderId.slice(-8)}`;

    await db.collection(PAYMENTS_COLLECTION).doc(paymentId).set({
      id: paymentId,
      subscriptionId: subscription.id,
      clubId: subscription.clubId,
      userId: subscription.userId,
      userEmail: subscription.userEmail,
      orderId,
      paymentKey: result.data.paymentKey,
      amount: subscription.price,
      planId: subscription.planId,
      planName: subscription.planName,
      status: 'success',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Subscription renewed: ${subscription.id}`);

    return true;
  } else {
    // 결제 실패: 재시도 카운트 증가
    const currentRetryCount = subscription.retryCount ?? 0;
    const newRetryCount = currentRetryCount + 1;

    if (newRetryCount >= MAX_RETRY_COUNT) {
      // 최대 재시도 횟수 도달: 구독 만료 처리
      await db
        .collection(SUBSCRIPTIONS_COLLECTION)
        .doc(subscription.id)
        .update({
          status: 'expired' as SubscriptionStatus,
          retryCount: newRetryCount,
          lastPaymentError: result.error.message,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.error(
        `Subscription expired after ${MAX_RETRY_COUNT} retries: ${subscription.id}`,
      );

      // TODO: 사용자에게 구독 만료 알림 발송 (이메일/푸시)
    } else {
      // 재시도 대기 상태
      await db
        .collection(SUBSCRIPTIONS_COLLECTION)
        .doc(subscription.id)
        .update({
          status: 'payment_failed' as SubscriptionStatus,
          retryCount: newRetryCount,
          lastPaymentError: result.error.message,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.warn(
        `Payment failed for subscription ${subscription.id}, retry ${newRetryCount}/${MAX_RETRY_COUNT}`,
      );

      // TODO: 사용자에게 결제 실패 알림 발송
    }

    // 실패한 결제 기록
    const paymentId = `pay_${Date.now()}_${orderId.slice(-8)}`;

    await db.collection(PAYMENTS_COLLECTION).doc(paymentId).set({
      id: paymentId,
      subscriptionId: subscription.id,
      clubId: subscription.clubId,
      userId: subscription.userId,
      userEmail: subscription.userEmail,
      orderId,
      paymentKey: '',
      amount: subscription.price,
      planId: subscription.planId,
      planName: subscription.planName,
      status: 'failed',
      errorCode: result.error.code,
      errorMessage: result.error.message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return false;
  }
}

/**
 * 정기결제 스케줄러 - 매일 오전 9시(KST) 실행
 * 만료일이 오늘인 구독을 찾아 결제 갱신 처리
 */
export const processSubscriptionRenewals = onSchedule(
  {
    schedule: '0 0 * * *', // 매일 자정 (UTC) = 오전 9시 (KST)
    timeZone: 'Asia/Seoul',
    retryCount: 3,
  },
  async () => {
    console.log('Starting subscription renewal process...');

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );

    // 오늘 만료되는 active 구독 조회
    const subscriptionsSnapshot = await db
      .collection(SUBSCRIPTIONS_COLLECTION)
      .where('status', '==', 'active')
      .where('endDate', '>=', startOfDay)
      .where('endDate', '<', endOfDay)
      .get();

    console.log(`Found ${subscriptionsSnapshot.size} subscriptions to renew`);

    const results = {
      total: subscriptionsSnapshot.size,
      success: 0,
      failed: 0,
    };

    for (const doc of subscriptionsSnapshot.docs) {
      const subscription = doc.data() as Subscription;

      // 무료 플랜은 건너뛰기
      if (subscription.price === 0) {
        console.log(`Skipping free plan subscription: ${subscription.id}`);

        continue;
      }

      const success = await renewSubscription(subscription);

      if (success) {
        results.success++;
      } else {
        results.failed++;
      }
    }

    console.log(
      `Subscription renewal complete: ${results.success} success, ${results.failed} failed`,
    );
  },
);

/**
 * 결제 실패 재시도 스케줄러 - 매일 오후 2시(KST) 실행
 * payment_failed 상태인 구독에 대해 재시도
 */
export const retryFailedPayments = onSchedule(
  {
    schedule: '0 5 * * *', // 매일 오전 5시 (UTC) = 오후 2시 (KST)
    timeZone: 'Asia/Seoul',
    retryCount: 3,
  },
  async () => {
    console.log('Starting failed payment retry process...');

    // payment_failed 상태이고 재시도 횟수가 남은 구독 조회
    const subscriptionsSnapshot = await db
      .collection(SUBSCRIPTIONS_COLLECTION)
      .where('status', '==', 'payment_failed')
      .where('retryCount', '<', MAX_RETRY_COUNT)
      .get();

    console.log(
      `Found ${subscriptionsSnapshot.size} failed subscriptions to retry`,
    );

    const results = {
      total: subscriptionsSnapshot.size,
      success: 0,
      failed: 0,
    };

    for (const doc of subscriptionsSnapshot.docs) {
      const subscription = doc.data() as Subscription;

      const success = await renewSubscription(subscription);

      if (success) {
        results.success++;

        // 재시도 성공 시 active 상태로 복구
        await db
          .collection(SUBSCRIPTIONS_COLLECTION)
          .doc(subscription.id)
          .update({
            status: 'active' as SubscriptionStatus,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
      } else {
        results.failed++;
      }
    }

    console.log(
      `Failed payment retry complete: ${results.success} success, ${results.failed} failed`,
    );
  },
);

/**
 * 만료 구독 정리 스케줄러 - 매주 월요일 오전 3시(KST) 실행
 * 30일 이상 만료된 구독을 FREE 플랜으로 다운그레이드
 */
export const cleanupExpiredSubscriptions = onSchedule(
  {
    schedule: '0 18 * * 0', // 매주 일요일 오후 6시 (UTC) = 월요일 오전 3시 (KST)
    timeZone: 'Asia/Seoul',
    retryCount: 1,
  },
  async () => {
    console.log('Starting expired subscription cleanup...');

    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 30일 이상 지난 만료 구독 조회
    const expiredSnapshot = await db
      .collection(SUBSCRIPTIONS_COLLECTION)
      .where('status', '==', 'expired')
      .where('endDate', '<', thirtyDaysAgo)
      .get();

    console.log(
      `Found ${expiredSnapshot.size} expired subscriptions to cleanup`,
    );

    // 만료된 구독의 플랜을 FREE로 다운그레이드
    for (const doc of expiredSnapshot.docs) {
      await doc.ref.update({
        planId: 'FREE',
        planName: 'Free',
        price: 0,
        status: 'active' as SubscriptionStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Downgraded subscription to FREE: ${doc.id}`);
    }

    console.log('Expired subscription cleanup complete');
  },
);
