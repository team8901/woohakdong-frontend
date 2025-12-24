import { firebaseDb } from '@workspace/firebase/firebase-config';
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  type Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const PAYMENTS_COLLECTION = 'payments';
const BILLING_KEYS_COLLECTION = 'billingKeys';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'expired'
  | 'pending'
  | 'payment_failed';

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

export type BillingCycle = 'monthly' | 'yearly';

export type Subscription = {
  id: string;
  clubId: number;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  price: number;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  startDate: Timestamp;
  endDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // 구독 취소 시점 (취소했지만 endDate까지 이용 가능)
  canceledAt?: Timestamp;
  // 다음 결제일에 적용될 플랜 (업그레이드/다운그레이드 예약)
  nextPlanId?: string;
  nextPlanName?: string;
  nextPlanPrice?: number;
  // 빌링 주기 변경 시 남은 크레딧 (다음 결제에서 차감)
  credit?: number;
  // 결제 실패 시 재시도 정보 (스케줄러에서 설정)
  retryCount?: number;
  lastPaymentError?: string;
};

export type PaymentRecordType =
  | 'renewal' // 정기 결제 갱신
  | 'plan_change' // 플랜 변경 (다운그레이드)
  | 'upgrade' // 플랜 업그레이드
  | 'billing_cycle_change' // 빌링 주기 변경
  | 'downgrade_to_free' // 무료 플랜 다운그레이드
  | 'subscription_canceled' // 구독 취소 만료
  | 'credit_applied'; // 크레딧 적용

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
  // 결제 유형
  type?: PaymentRecordType;
  // 플랜 변경 시 이전 플랜 정보
  previousPlanId?: string;
  previousPlanName?: string;
  // 크레딧 적용 금액
  creditApplied?: number;
  // 결제 완료 시간
  paidAt?: string;
  // 실패 시 에러 정보
  errorCode?: string;
  errorMessage?: string;
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
 * 테스트 빌링 주기 (분)
 * - 환경변수 NEXT_PUBLIC_TEST_BILLING_CYCLE_MINUTES로 설정
 * - 설정하지 않으면 null (일반 빌링 주기 사용)
 */
const getTestBillingCycleMinutes = (): number | null => {
  const envValue = process.env.NEXT_PUBLIC_TEST_BILLING_CYCLE_MINUTES;

  if (!envValue) return null;

  const minutes = parseInt(envValue, 10);

  return isNaN(minutes) ? null : minutes;
};

/**
 * 구독 종료일 계산
 * - 테스트 빌링 주기 환경변수가 설정되어 있으면 해당 분 후
 * - 연간 결제: 1년 후
 * - 월간 결제: 1개월 후
 */
const calculateEndDate = (isYearly: boolean): Date => {
  const endDate = new Date();
  const testCycleMinutes = getTestBillingCycleMinutes();

  if (testCycleMinutes !== null) {
    endDate.setTime(endDate.getTime() + testCycleMinutes * 60 * 1000);
  } else if (isYearly) {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  return endDate;
};

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
    const endDate = calculateEndDate(false);

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
 * 동아리의 현재 구독 조회
 * - status가 'active' 또는 'payment_failed'인 구독 조회
 * - canceledAt이 있으면 취소 예정이지만 endDate까지 이용 가능
 * 우선순위:
 * 1. 결제 실패 구독 (사용자에게 알림 표시 필요)
 * 2. 활성 유료 구독 (canceledAt 유무와 관계없이)
 * 3. 활성 무료 구독
 * @param clubId - 동아리 ID
 * @returns 구독 정보 또는 null
 */
export const getCurrentSubscription = async (
  clubId: number,
): Promise<Subscription | null> => {
  try {
    const subscriptionsRef = collection(firebaseDb, SUBSCRIPTIONS_COLLECTION);

    // 활성 구독 조회
    const activeQuery = query(
      subscriptionsRef,
      where('clubId', '==', clubId),
      where('status', '==', 'active'),
    );

    // 결제 실패 구독 조회
    const failedQuery = query(
      subscriptionsRef,
      where('clubId', '==', clubId),
      where('status', '==', 'payment_failed'),
    );

    const [activeSnapshot, failedSnapshot] = await Promise.all([
      getDocs(activeQuery),
      getDocs(failedQuery),
    ]);

    // 1. 결제 실패 구독 우선 (사용자에게 알림 표시 필요)
    if (!failedSnapshot.empty) {
      const failedDoc = failedSnapshot.docs[0];

      if (failedDoc) {
        return failedDoc.data() as Subscription;
      }
    }

    if (activeSnapshot.empty) {
      return null;
    }

    const subscriptions = activeSnapshot.docs.map(
      (doc) => doc.data() as Subscription,
    );

    // 2. 활성 유료 구독 (canceledAt 유무와 관계없이 endDate까지 이용 가능)
    const activePaid = subscriptions.find((sub) => sub.price > 0);

    if (activePaid) {
      return activePaid;
    }

    // 3. 활성 무료 구독
    const activeFree = subscriptions.find((sub) => sub.price === 0);

    if (activeFree) {
      return activeFree;
    }

    return null;
  } catch (error) {
    console.error('Failed to get current subscription:', error);

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
 * 구독 취소 (endDate까지는 이용 가능)
 * - status는 'active' 유지
 * - canceledAt 필드 추가하여 취소 시점 기록
 * - endDate 이후에는 스케줄러가 status를 'expired'로 변경
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
      canceledAt: serverTimestamp(),
      // 예약된 플랜 변경 정보 초기화 (취소 시 모든 예정된 변경 무효화)
      nextPlanId: deleteField(),
      nextPlanName: deleteField(),
      nextPlanPrice: deleteField(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to cancel subscription:', error);

    throw new SubscriptionError('구독 취소 중 오류가 발생했습니다.');
  }
};

/**
 * 취소된 구독 재활성화 (canceledAt 제거)
 * @param subscriptionId - 구독 ID
 */
export const reactivateSubscription = async (
  subscriptionId: string,
): Promise<void> => {
  try {
    const subscriptionRef = doc(
      firebaseDb,
      SUBSCRIPTIONS_COLLECTION,
      subscriptionId,
    );

    await updateDoc(subscriptionRef, {
      canceledAt: deleteField(),
      // 예약된 플랜 변경이 있었다면 제거
      nextPlanId: deleteField(),
      nextPlanName: deleteField(),
      nextPlanPrice: deleteField(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to reactivate subscription:', error);

    throw new SubscriptionError('구독 재활성화 중 오류가 발생했습니다.');
  }
};

/**
 * 플랜 변경 예약 (다음 결제일에 적용)
 * @param subscriptionId - 구독 ID
 * @param nextPlanId - 다음 플랜 ID
 * @param nextPlanName - 다음 플랜 이름
 * @param nextPlanPrice - 다음 플랜 가격
 */
export const schedulePlanChange = async (
  subscriptionId: string,
  nextPlanId: string,
  nextPlanName: string,
  nextPlanPrice: number,
): Promise<void> => {
  try {
    const subscriptionRef = doc(
      firebaseDb,
      SUBSCRIPTIONS_COLLECTION,
      subscriptionId,
    );

    await updateDoc(subscriptionRef, {
      nextPlanId,
      nextPlanName,
      nextPlanPrice,
      status: 'active', // 취소된 구독도 재활성화
      canceledAt: deleteField(), // 취소 상태 제거
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to schedule plan change:', error);

    throw new SubscriptionError('플랜 변경 예약 중 오류가 발생했습니다.');
  }
};

/**
 * 플랜 변경 예약 취소
 * @param subscriptionId - 구독 ID
 */
export const cancelScheduledPlanChange = async (
  subscriptionId: string,
): Promise<void> => {
  try {
    const subscriptionRef = doc(
      firebaseDb,
      SUBSCRIPTIONS_COLLECTION,
      subscriptionId,
    );

    await updateDoc(subscriptionRef, {
      nextPlanId: deleteField(),
      nextPlanName: deleteField(),
      nextPlanPrice: deleteField(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to cancel scheduled plan change:', error);

    throw new SubscriptionError('플랜 변경 예약 취소 중 오류가 발생했습니다.');
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
 * - 트랜잭션을 사용하여 기존 기본 카드 해제 + 새 카드 등록을 원자적으로 처리
 * @param input - 빌링키 생성에 필요한 정보
 * @returns 생성된 빌링키 문서 ID
 */
export const saveBillingKey = async (
  input: CreateBillingKeyInput,
): Promise<string> => {
  try {
    const billingKeyId = `billing_${Date.now()}_${input.clubId}`;

    // 1. 트랜잭션 외부에서 기존 기본 카드 문서 ID 목록 조회
    const billingKeysRef = collection(firebaseDb, BILLING_KEYS_COLLECTION);
    const q = query(
      billingKeysRef,
      where('clubId', '==', input.clubId),
      where('isDefault', '==', true),
    );
    const snapshot = await getDocs(q);
    const existingDefaultIds = snapshot.docs.map((d) => d.id);

    await runTransaction(firebaseDb, async (transaction) => {
      // 2. 트랜잭션 내에서 기존 기본 카드 해제
      for (const docId of existingDefaultIds) {
        const docRef = doc(firebaseDb, BILLING_KEYS_COLLECTION, docId);
        const docSnap = await transaction.get(docRef);

        // 여전히 기본 카드인 경우에만 해제
        if (docSnap.exists() && docSnap.data().isDefault) {
          transaction.update(docRef, {
            isDefault: false,
            updatedAt: serverTimestamp(),
          });
        }
      }

      // 3. 새 빌링키 생성
      const newBillingKeyRef = doc(
        firebaseDb,
        BILLING_KEYS_COLLECTION,
        billingKeyId,
      );

      transaction.set(newBillingKeyRef, {
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
 * - 활성 유료 구독이 있고 마지막 결제수단인 경우 삭제 불가
 * - 기본 결제수단 삭제 시 다른 결제수단을 기본으로 자동 설정
 * - 트랜잭션 내에서 모든 검증 수행하여 race condition 방지
 * @param billingKeyId - 빌링키 문서 ID
 * @param clubId - 동아리 ID (마지막 결제수단 검증용)
 */
export const deleteBillingKey = async (
  billingKeyId: string,
  clubId: number,
): Promise<void> => {
  try {
    // 1. 트랜잭션 외부에서 필요한 문서 ID 목록 조회
    const billingKeys = await getBillingKeys(clubId);
    const billingKeyIds = billingKeys
      .filter((key) => key.billingKey && key.billingKey.length > 0)
      .map((key) => key.id);

    // 활성 구독 문서 ID 조회
    const subscriptionsRef = collection(firebaseDb, SUBSCRIPTIONS_COLLECTION);
    const activeSubQuery = query(
      subscriptionsRef,
      where('clubId', '==', clubId),
      where('status', '==', 'active'),
    );
    const activeSubSnapshot = await getDocs(activeSubQuery);
    const activeSubIds = activeSubSnapshot.docs
      .filter((d) => d.data().price > 0)
      .map((d) => d.id);

    await runTransaction(firebaseDb, async (transaction) => {
      // 2. 트랜잭션 내에서 모든 빌링키 문서 읽기 (최신 데이터 보장)
      const billingKeyRefs = billingKeyIds.map((id) =>
        doc(firebaseDb, BILLING_KEYS_COLLECTION, id),
      );
      const billingKeySnapshots = await Promise.all(
        billingKeyRefs.map((ref) => transaction.get(ref)),
      );

      // 유효한 빌링키만 필터링 (삭제되지 않은 것)
      const validBillingKeys = billingKeySnapshots
        .filter((snap) => {
          if (!snap.exists()) return false;

          const data = snap.data();

          return data.billingKey && data.billingKey.length > 0;
        })
        .map((snap) => ({ id: snap.id, ...snap.data() })) as BillingKey[];

      // 삭제하려는 빌링키 찾기
      const targetKey = validBillingKeys.find((key) => key.id === billingKeyId);

      if (!targetKey) {
        throw new SubscriptionError('결제수단을 찾을 수 없습니다.');
      }

      // 3. 트랜잭션 내에서 활성 유료 구독 재확인
      let hasPaidSubscription = false;

      for (const subId of activeSubIds) {
        const subRef = doc(firebaseDb, SUBSCRIPTIONS_COLLECTION, subId);
        const subSnap = await transaction.get(subRef);

        if (subSnap.exists()) {
          const data = subSnap.data();

          if (data.status === 'active' && data.price > 0) {
            hasPaidSubscription = true;
            break;
          }
        }
      }

      if (hasPaidSubscription && validBillingKeys.length <= 1) {
        throw new SubscriptionError(
          '활성 구독이 있어 마지막 결제수단을 삭제할 수 없습니다. 구독을 취소하거나 다른 결제수단을 먼저 등록해주세요.',
        );
      }

      // 3. 삭제 대상 빌링키 soft delete
      const targetRef = doc(firebaseDb, BILLING_KEYS_COLLECTION, billingKeyId);

      transaction.update(targetRef, {
        billingKey: '',
        isDefault: false,
        updatedAt: serverTimestamp(),
      });

      // 4. 기본 결제수단이었고 다른 결제수단이 있으면 첫 번째를 기본으로 설정
      const isDefaultKey = targetKey.isDefault;
      const otherValidKeys = validBillingKeys.filter(
        (key) => key.id !== billingKeyId,
      );

      if (isDefaultKey && otherValidKeys.length > 0) {
        const newDefaultKey = otherValidKeys[0];

        if (newDefaultKey) {
          const newDefaultRef = doc(
            firebaseDb,
            BILLING_KEYS_COLLECTION,
            newDefaultKey.id,
          );

          transaction.update(newDefaultRef, {
            isDefault: true,
            updatedAt: serverTimestamp(),
          });
        }
      }
    });
  } catch (error) {
    console.error('Failed to delete billing key:', error);

    if (error instanceof SubscriptionError) {
      throw error;
    }

    throw new SubscriptionError('카드 삭제 중 오류가 발생했습니다.');
  }
};

/**
 * 기본 빌링키 설정
 * - 트랜잭션을 사용하여 기존 기본 카드 해제 + 새 기본 카드 설정을 원자적으로 처리
 * @param billingKeyId - 기본으로 설정할 빌링키 문서 ID
 * @param clubId - 동아리 ID
 */
export const setDefaultBillingKey = async (
  billingKeyId: string,
  clubId: number,
): Promise<void> => {
  try {
    // 1. 트랜잭션 외부에서 기존 기본 카드 문서 ID 목록 조회
    const billingKeysRef = collection(firebaseDb, BILLING_KEYS_COLLECTION);
    const q = query(
      billingKeysRef,
      where('clubId', '==', clubId),
      where('isDefault', '==', true),
    );
    const snapshot = await getDocs(q);
    const existingDefaultIds = snapshot.docs.map((d) => d.id);

    await runTransaction(firebaseDb, async (transaction) => {
      // 2. 새 기본 카드로 설정할 문서 확인
      const newDefaultRef = doc(
        firebaseDb,
        BILLING_KEYS_COLLECTION,
        billingKeyId,
      );
      const newDefaultDoc = await transaction.get(newDefaultRef);

      if (!newDefaultDoc.exists()) {
        throw new SubscriptionError('빌링키를 찾을 수 없습니다.');
      }

      // 3. 기존 기본 카드 해제 (새 기본 카드와 다른 경우만)
      for (const docId of existingDefaultIds) {
        if (docId !== billingKeyId) {
          const docRef = doc(firebaseDb, BILLING_KEYS_COLLECTION, docId);
          const docSnap = await transaction.get(docRef);

          // 여전히 기본 카드인 경우에만 해제
          if (docSnap.exists() && docSnap.data().isDefault) {
            transaction.update(docRef, {
              isDefault: false,
              updatedAt: serverTimestamp(),
            });
          }
        }
      }

      // 4. 새 기본 카드 설정
      transaction.update(newDefaultRef, {
        isDefault: true,
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    console.error('Failed to set default billing key:', error);

    if (error instanceof SubscriptionError) {
      throw error;
    }

    throw new SubscriptionError('기본 카드 설정 중 오류가 발생했습니다.');
  }
};

export type CreateSubscriptionWithPaymentInput = {
  clubId: number;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  price: number;
  isYearly: boolean;
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
    const endDate = calculateEndDate(input.isYearly);
    const billingCycle: BillingCycle = input.isYearly ? 'yearly' : 'monthly';

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
      billingCycle,
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

export type UpgradePlanInput = {
  subscriptionId: string;
  clubId: number;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  newPrice: number; // 새 플랜 가격 (월간이면 월 가격, 연간이면 연 가격)
  proratedAmount: number; // 비례 정산 금액 (실제 청구 금액)
  billingKeyId: string;
  orderId: string;
  transactionId: string;
  /** 빌링 주기 변경 시 필수 */
  newBillingCycle?: BillingCycle;
  /** 남은 크레딧 (다음 결제 시 적용) */
  remainingCredit?: number;
  /** 이전 플랜 정보 (결제 기록용) */
  previousPlanId?: string;
  previousPlanName?: string;
  /** 적용된 크레딧 금액 (결제 기록용) */
  creditApplied?: number;
};

/**
 * 즉시 플랜 업그레이드 (비례 정산)
 * - 구독 플랜을 즉시 변경
 * - 비례 정산된 금액으로 결제 기록 생성
 * - 빌링 주기 변경 시 새로운 주기로 startDate/endDate 갱신
 * - 남은 크레딧은 다음 결제에서 자동 차감
 * @param input - 업그레이드에 필요한 정보
 */
export const upgradePlan = async (input: UpgradePlanInput): Promise<void> => {
  try {
    const subscriptionRef = doc(
      firebaseDb,
      SUBSCRIPTIONS_COLLECTION,
      input.subscriptionId,
    );

    // 기본 업데이트 데이터
    const updateData: Record<string, unknown> = {
      planId: input.planId,
      planName: input.planName,
      price: input.newPrice,
      billingKeyId: input.billingKeyId,
      status: 'active', // 취소된 구독도 재활성화
      canceledAt: deleteField(), // 취소 상태 제거
      // nextPlan 필드가 있으면 제거 (즉시 업그레이드했으므로)
      nextPlanId: deleteField(),
      nextPlanName: deleteField(),
      nextPlanPrice: deleteField(),
      updatedAt: serverTimestamp(),
    };

    // 빌링 주기 변경 시 새로운 주기로 startDate/endDate 갱신
    if (input.newBillingCycle) {
      const newEndDate = calculateEndDate(input.newBillingCycle === 'yearly');

      updateData.billingCycle = input.newBillingCycle;
      updateData.startDate = serverTimestamp();
      updateData.endDate = newEndDate;
    }

    // 남은 크레딧 처리 (빌링 주기 변경 여부와 관계없이)
    if (input.remainingCredit && input.remainingCredit > 0) {
      updateData.credit = input.remainingCredit;
    } else {
      // 크레딧이 사용되었거나 없으면 제거
      updateData.credit = deleteField();
    }

    await updateDoc(subscriptionRef, updateData);

    // 비례 정산 결제 기록 생성
    const paymentId = `pay_${Date.now()}_${input.orderId.slice(-8)}`;
    const paymentRef = doc(firebaseDb, PAYMENTS_COLLECTION, paymentId);

    const paymentRecord: Record<string, unknown> = {
      id: paymentId,
      subscriptionId: input.subscriptionId,
      clubId: input.clubId,
      userId: input.userId,
      userEmail: input.userEmail,
      orderId: input.orderId,
      transactionId: input.transactionId,
      amount: input.proratedAmount,
      planId: input.planId,
      planName: input.planName,
      status: 'success',
      type: input.newBillingCycle ? 'billing_cycle_change' : 'upgrade',
      createdAt: serverTimestamp(),
    };

    // 이전 플랜 정보 추가
    if (input.previousPlanId) {
      paymentRecord.previousPlanId = input.previousPlanId;
    }

    if (input.previousPlanName) {
      paymentRecord.previousPlanName = input.previousPlanName;
    }

    // 적용된 크레딧 정보 추가
    if (input.creditApplied && input.creditApplied > 0) {
      paymentRecord.creditApplied = input.creditApplied;
    }

    await setDoc(paymentRef, paymentRecord);
  } catch (error) {
    console.error('Failed to upgrade plan:', error);

    throw new SubscriptionError('플랜 업그레이드 중 오류가 발생했습니다.');
  }
};

/**
 * 빌링키로 구독 생성 (Mock 환경용 - 결제 없이)
 * @param input - 구독 생성에 필요한 정보
 * @param billingKeyId - 사용할 빌링키 ID
 * @param isYearly - 연간 결제 여부
 * @returns 생성된 구독 ID
 */
export const createMockSubscription = async (
  input: Omit<CreateSubscriptionInput, 'orderId' | 'transactionId'>,
  billingKeyId: string,
  isYearly = false,
): Promise<string> => {
  try {
    const subscriptionId = `sub_${Date.now()}_${input.clubId}`;
    const endDate = calculateEndDate(isYearly);
    const billingCycle: BillingCycle = isYearly ? 'yearly' : 'monthly';

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
      billingCycle,
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

export type RetryPaymentInput = {
  subscriptionId: string;
  clubId: number;
  userId: string;
  userEmail: string;
  orderId: string;
  transactionId: string;
  amount: number;
};

/**
 * 결제 실패 후 수동 재시도 성공 시 구독 상태 업데이트
 * - 구독 상태를 'active'로 변경
 * - retryCount 초기화
 * - lastPaymentError 제거
 * - 새로운 endDate 설정
 * - 결제 기록 생성
 * @param input - 재시도 결제 정보
 */
export const completeRetryPayment = async (
  input: RetryPaymentInput,
): Promise<void> => {
  try {
    const subscriptionRef = doc(
      firebaseDb,
      SUBSCRIPTIONS_COLLECTION,
      input.subscriptionId,
    );

    // 현재 구독 정보 조회
    const subscriptionSnap = await getDoc(subscriptionRef);

    if (!subscriptionSnap.exists()) {
      throw new SubscriptionError('구독을 찾을 수 없습니다.');
    }

    const subscription = subscriptionSnap.data() as Subscription;

    // 새로운 endDate 계산
    const isYearly = subscription.billingCycle === 'yearly';
    const newEndDate = calculateEndDate(isYearly);

    // 구독 상태 업데이트
    await updateDoc(subscriptionRef, {
      status: 'active',
      retryCount: deleteField(),
      lastPaymentError: deleteField(),
      endDate: newEndDate,
      updatedAt: serverTimestamp(),
    });

    // 결제 기록 생성
    const paymentId = `pay_${Date.now()}_${input.orderId.slice(-8)}`;
    const paymentRef = doc(firebaseDb, PAYMENTS_COLLECTION, paymentId);

    await setDoc(paymentRef, {
      id: paymentId,
      subscriptionId: input.subscriptionId,
      clubId: input.clubId,
      userId: input.userId,
      userEmail: input.userEmail,
      orderId: input.orderId,
      transactionId: input.transactionId,
      amount: input.amount,
      planId: subscription.planId,
      planName: subscription.planName,
      status: 'success',
      type: 'renewal',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to complete retry payment:', error);

    if (error instanceof SubscriptionError) {
      throw error;
    }

    throw new SubscriptionError('결제 재시도 처리 중 오류가 발생했습니다.');
  }
};
