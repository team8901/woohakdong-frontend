import { firebaseDb } from '@workspace/firebase/firebase-config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const PAYMENTS_COLLECTION = 'payments';

export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'pending';

export type Subscription = {
  id: string;
  clubId: number;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  price: number;
  status: SubscriptionStatus;
  startDate: Timestamp;
  endDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type PaymentRecord = {
  id: string;
  subscriptionId: string;
  clubId: number;
  userId: string;
  userEmail: string;
  orderId: string;
  paymentKey: string;
  amount: number;
  planId: string;
  planName: string;
  status: 'success' | 'failed' | 'pending';
  createdAt: Timestamp;
};

export type CreateSubscriptionInput = {
  clubId: number;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  price: number;
  orderId: string;
  paymentKey: string;
};

class SubscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

/**
 * 동아리 구독 정보 저장 및 결제 기록 생성 (유료 플랜 전용)
 * @param input - 구독 생성에 필요한 정보
 * @returns 생성된 구독 ID
 */
export const createSubscription = async (
  input: CreateSubscriptionInput,
): Promise<string> => {
  try {
    const subscriptionId = `sub_${Date.now()}_${input.clubId}`;
    const now = new Date();
    const endDate = new Date(now);

    endDate.setMonth(endDate.getMonth() + 1);

    // 구독 문서 생성
    const subscriptionRef = doc(
      firebaseDb,
      SUBSCRIPTIONS_COLLECTION,
      subscriptionId,
    );

    await setDoc(subscriptionRef, {
      id: subscriptionId,
      clubId: input.clubId,
      userId: input.userId,
      userEmail: input.userEmail,
      planId: input.planId,
      planName: input.planName,
      price: input.price,
      status: 'active' as SubscriptionStatus,
      startDate: serverTimestamp(),
      endDate: endDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 결제 기록 생성
    const paymentId = `pay_${Date.now()}_${input.orderId.slice(-8)}`;
    const paymentRef = doc(firebaseDb, PAYMENTS_COLLECTION, paymentId);

    await setDoc(paymentRef, {
      id: paymentId,
      subscriptionId,
      clubId: input.clubId,
      userId: input.userId,
      userEmail: input.userEmail,
      orderId: input.orderId,
      paymentKey: input.paymentKey,
      amount: input.price,
      planId: input.planId,
      planName: input.planName,
      status: 'success',
      createdAt: serverTimestamp(),
    });

    return subscriptionId;
  } catch (error) {
    console.error('Failed to create subscription:', error);

    throw new SubscriptionError('구독 생성 중 오류가 발생했습니다.');
  }
};

/**
 * 동아리의 현재 활성 구독 조회
 * @param clubId - 동아리 ID
 * @returns 활성 구독 정보 또는 null
 */
export const getActiveSubscription = async (
  clubId: number,
): Promise<Subscription | null> => {
  try {
    const subscriptionsRef = collection(firebaseDb, SUBSCRIPTIONS_COLLECTION);
    const q = query(
      subscriptionsRef,
      where('clubId', '==', clubId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(1),
    );

    const snapshot = await getDocs(q);
    const firstDoc = snapshot.docs[0];

    if (snapshot.empty || !firstDoc) {
      return null;
    }

    return firstDoc.data() as Subscription;
  } catch (error) {
    console.error('Failed to get active subscription:', error);

    throw new SubscriptionError('구독 조회 중 오류가 발생했습니다.');
  }
};

/**
 * 구독 ID로 구독 정보 조회
 * @param subscriptionId - 구독 ID
 * @returns 구독 정보 또는 null
 */
export const getSubscriptionById = async (
  subscriptionId: string,
): Promise<Subscription | null> => {
  try {
    const subscriptionRef = doc(
      firebaseDb,
      SUBSCRIPTIONS_COLLECTION,
      subscriptionId,
    );
    const snapshot = await getDoc(subscriptionRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as Subscription;
  } catch (error) {
    console.error('Failed to get subscription:', error);

    throw new SubscriptionError('구독 조회 중 오류가 발생했습니다.');
  }
};

/**
 * 구독 취소
 * @param subscriptionId - 구독 ID
 */
export const cancelSubscription = async (
  subscriptionId: string,
): Promise<void> => {
  try {
    const subscriptionRef = doc(
      firebaseDb,
      SUBSCRIPTIONS_COLLECTION,
      subscriptionId,
    );

    await updateDoc(subscriptionRef, {
      status: 'canceled',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to cancel subscription:', error);

    throw new SubscriptionError('구독 취소 중 오류가 발생했습니다.');
  }
};

/**
 * 동아리의 결제 내역 조회
 * @param clubId - 동아리 ID
 * @returns 결제 기록 배열
 */
export const getPaymentHistory = async (
  clubId: number,
): Promise<PaymentRecord[]> => {
  try {
    const paymentsRef = collection(firebaseDb, PAYMENTS_COLLECTION);
    const q = query(
      paymentsRef,
      where('clubId', '==', clubId),
      orderBy('createdAt', 'desc'),
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => doc.data() as PaymentRecord);
  } catch (error) {
    console.error('Failed to get payment history:', error);

    throw new SubscriptionError('결제 내역 조회 중 오류가 발생했습니다.');
  }
};
