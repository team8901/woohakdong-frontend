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
const BILLING_KEYS_COLLECTION = 'billingKeys';

export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'pending';

export type BillingKey = {
  id: string;
  clubId: number;
  userId: string;
  userEmail: string;
  billingKey: string;
  customerKey: string;
  cardCompany: string;
  cardNumber: string; // 마스킹된 카드번호 (예: **** **** **** 1234)
  isDefault: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type CreateBillingKeyInput = {
  clubId: number;
  userId: string;
  userEmail: string;
  billingKey: string;
  customerKey: string;
  cardCompany: string;
  cardNumber: string;
};

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
  transactionId: string; // 포트원 트랜잭션 ID
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
  transactionId: string; // 포트원 트랜잭션 ID
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
      transactionId: input.transactionId,
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

/**
 * 빌링키 저장 (카드 등록)
 * @param input - 빌링키 생성에 필요한 정보
 * @returns 생성된 빌링키 문서 ID
 */
export const saveBillingKey = async (
  input: CreateBillingKeyInput,
): Promise<string> => {
  try {
    const billingKeyId = `billing_${Date.now()}_${input.clubId}`;
    const billingKeyRef = doc(
      firebaseDb,
      BILLING_KEYS_COLLECTION,
      billingKeyId,
    );

    // 기존 기본 카드가 있으면 해제
    const existingKeys = await getBillingKeys(input.clubId);

    for (const key of existingKeys) {
      if (key.isDefault) {
        const existingRef = doc(firebaseDb, BILLING_KEYS_COLLECTION, key.id);

        await updateDoc(existingRef, {
          isDefault: false,
          updatedAt: serverTimestamp(),
        });
      }
    }

    await setDoc(billingKeyRef, {
      id: billingKeyId,
      clubId: input.clubId,
      userId: input.userId,
      userEmail: input.userEmail,
      billingKey: input.billingKey,
      customerKey: input.customerKey,
      cardCompany: input.cardCompany,
      cardNumber: input.cardNumber,
      isDefault: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return billingKeyId;
  } catch (error) {
    console.error('Failed to save billing key:', error);

    throw new SubscriptionError('카드 등록 중 오류가 발생했습니다.');
  }
};

/**
 * 동아리의 등록된 빌링키(카드) 목록 조회
 * @param clubId - 동아리 ID
 * @returns 빌링키 배열
 */
export const getBillingKeys = async (clubId: number): Promise<BillingKey[]> => {
  try {
    const billingKeysRef = collection(firebaseDb, BILLING_KEYS_COLLECTION);
    const q = query(
      billingKeysRef,
      where('clubId', '==', clubId),
      orderBy('createdAt', 'desc'),
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => doc.data() as BillingKey);
  } catch (error) {
    console.error('Failed to get billing keys:', error);

    throw new SubscriptionError('카드 목록 조회 중 오류가 발생했습니다.');
  }
};

/**
 * 동아리의 기본 빌링키 조회
 * @param clubId - 동아리 ID
 * @returns 기본 빌링키 또는 null
 */
export const getDefaultBillingKey = async (
  clubId: number,
): Promise<BillingKey | null> => {
  try {
    const billingKeysRef = collection(firebaseDb, BILLING_KEYS_COLLECTION);
    const q = query(
      billingKeysRef,
      where('clubId', '==', clubId),
      where('isDefault', '==', true),
      limit(1),
    );

    const snapshot = await getDocs(q);
    const firstDoc = snapshot.docs[0];

    if (snapshot.empty || !firstDoc) {
      return null;
    }

    return firstDoc.data() as BillingKey;
  } catch (error) {
    console.error('Failed to get default billing key:', error);

    throw new SubscriptionError('기본 카드 조회 중 오류가 발생했습니다.');
  }
};

/**
 * 빌링키 삭제 (카드 삭제)
 * @param billingKeyId - 빌링키 문서 ID
 */
export const deleteBillingKey = async (billingKeyId: string): Promise<void> => {
  try {
    const billingKeyRef = doc(
      firebaseDb,
      BILLING_KEYS_COLLECTION,
      billingKeyId,
    );

    // Firestore에서는 delete 대신 soft delete 처리 (보안상)
    await updateDoc(billingKeyRef, {
      billingKey: '',
      isDefault: false,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to delete billing key:', error);

    throw new SubscriptionError('카드 삭제 중 오류가 발생했습니다.');
  }
};

export type CreateSubscriptionWithPaymentInput = {
  clubId: number;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  price: number;
  billingKeyId: string;
  orderId: string;
  transactionId: string; // 포트원 트랜잭션 ID
};

/**
 * 빌링키로 구독 생성 및 결제 기록 저장 (정기결제)
 * @param input - 구독 생성에 필요한 정보 (결제 정보 포함)
 * @returns 생성된 구독 ID
 *
 * 정기결제 갱신은 Firebase Functions에서 처리됨
 * @see packages/firebase/functions/src/index.ts
 * - processSubscriptionRenewals: 매일 오전 9시(KST) 만료 구독 갱신
 * - retryFailedPayments: 매일 오후 2시(KST) 결제 실패 재시도
 * - cleanupExpiredSubscriptions: 매주 월요일 오전 3시(KST) 만료 구독 정리
 */
export const createSubscriptionWithBillingKey = async (
  input: CreateSubscriptionWithPaymentInput,
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
      billingKeyId: input.billingKeyId,
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
      transactionId: input.transactionId,
      amount: input.price,
      planId: input.planId,
      planName: input.planName,
      status: 'success',
      createdAt: serverTimestamp(),
    });

    return subscriptionId;
  } catch (error) {
    console.error('Failed to create subscription with billing key:', error);

    throw new SubscriptionError('구독 생성 중 오류가 발생했습니다.');
  }
};

export type CreateFreeSubscriptionInput = {
  clubId: number;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
};

/**
 * 무료 플랜 구독 생성 (결제 없이)
 * - 기존 활성 구독이 있으면 취소 처리
 * - 새로운 무료 구독 생성
 * @param input - 구독 생성에 필요한 정보
 * @returns 생성된 구독 ID
 */
export const createFreeSubscription = async (
  input: CreateFreeSubscriptionInput,
): Promise<string> => {
  try {
    // 기존 활성 구독이 있으면 취소
    const existingSubscription = await getActiveSubscription(input.clubId);

    if (existingSubscription) {
      await cancelSubscription(existingSubscription.id);
    }

    const subscriptionId = `sub_${Date.now()}_${input.clubId}`;

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
      price: 0,
      status: 'active' as SubscriptionStatus,
      startDate: serverTimestamp(),
      endDate: null, // 무료 플랜은 만료일 없음
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return subscriptionId;
  } catch (error) {
    console.error('Failed to create free subscription:', error);

    throw new SubscriptionError('무료 구독 생성 중 오류가 발생했습니다.');
  }
};

/**
 * 빌링키로 구독 생성 (Mock 환경용 - 결제 없이)
 * @param input - 구독 생성에 필요한 정보
 * @param billingKeyId - 사용할 빌링키 ID
 * @returns 생성된 구독 ID
 */
export const createMockSubscription = async (
  input: Omit<CreateSubscriptionInput, 'orderId' | 'transactionId'>,
  billingKeyId: string,
): Promise<string> => {
  try {
    const subscriptionId = `sub_${Date.now()}_${input.clubId}`;
    const now = new Date();
    const endDate = new Date(now);

    endDate.setMonth(endDate.getMonth() + 1);

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
      billingKeyId,
      status: 'active' as SubscriptionStatus,
      startDate: serverTimestamp(),
      endDate: endDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return subscriptionId;
  } catch (error) {
    console.error('Failed to create mock subscription:', error);

    throw new SubscriptionError('구독 생성 중 오류가 발생했습니다.');
  }
};
