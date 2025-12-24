/**
 * Cloudflare Workers 정기결제 스케줄러
 *
 * Cron 스케줄:
 * - 매일 오전 9시 (KST): 구독 갱신 결제
 * - 매일 오후 2시 (KST): 결제 실패 재시도
 * - 매주 월요일 오전 3시 (KST): 만료 구독 정리
 *
 * @see https://developers.cloudflare.com/workers/
 * @see https://developers.portone.io/
 */

export interface Env {
  PORTONE_API_SECRET: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_SERVICE_ACCOUNT_KEY: string;
  ENVIRONMENT: string;
  // 테스트 엔드포인트 접근용 API 키 (선택)
  SCHEDULER_API_KEY?: string;
}

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

type BillingCycle = 'monthly' | 'yearly';

interface Subscription {
  id: string;
  clubId: number;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  price: number;
  billingCycle: BillingCycle;
  billingKeyId: string;
  status: SubscriptionStatus;
  startDate: { _seconds: number };
  endDate: { _seconds: number };
  retryCount?: number;
  lastPaymentError?: string;
  // 구독 취소 시점 (취소했지만 endDate까지 이용 가능)
  canceledAt?: { _seconds: number };
  // 예약된 플랜 변경
  nextPlanId?: string;
  nextPlanName?: string;
  nextPlanPrice?: number;
  // 빌링 주기 변경 시 남은 크레딧
  credit?: number;
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

interface PortonePaymentResponse {
  paymentId: string;
  transactionId: string;
  status: string;
  paidAt?: string;
  amount?: {
    total: number;
    paid: number;
  };
  message?: string;
}

/**
 * Firebase Auth 토큰 발급 (Service Account)
 */
async function getFirebaseAccessToken(env: Env): Promise<string> {
  const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
  const now = Math.floor(Date.now() / 1000);

  // JWT 헤더
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  // JWT 페이로드
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  };

  // Base64URL 인코딩
  const base64UrlEncode = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

  const headerEncoded = base64UrlEncode(header);
  const payloadEncoded = base64UrlEncode(payload);
  const signatureInput = `${headerEncoded}.${payloadEncoded}`;

  // RSA-SHA256 서명
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signatureInput),
  );

  const signatureEncoded = arrayBufferToBase64Url(signature);
  const jwt = `${signatureInput}.${signatureEncoded}`;

  // OAuth2 토큰 교환
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = (await tokenResponse.json()) as { access_token: string };

  return tokenData.access_token;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');

  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Firestore 문서 조회 (REST API)
 */
async function queryFirestore(
  env: Env,
  accessToken: string,
  collection: string,
  filters: Array<{ field: string; op: string; value: unknown }>,
): Promise<unknown[]> {
  const projectId = env.FIREBASE_PROJECT_ID;

  const structuredQuery = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: filters.map((f) => ({
            fieldFilter: {
              field: { fieldPath: f.field },
              op: f.op,
              value: convertToFirestoreValue(f.value),
            },
          })),
        },
      },
    },
  };

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(structuredQuery),
    },
  );

  const results = (await response.json()) as Array<{
    document?: { fields: Record<string, unknown> };
  }>;

  return results
    .filter((r) => r.document)
    .map((r) => parseFirestoreDocument(r.document!.fields));
}

/**
 * Firestore 문서 가져오기
 */
async function getFirestoreDocument(
  env: Env,
  accessToken: string,
  collection: string,
  docId: string,
): Promise<unknown | null> {
  const projectId = env.FIREBASE_PROJECT_ID;

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) return null;

  const doc = (await response.json()) as { fields: Record<string, unknown> };

  return parseFirestoreDocument(doc.fields);
}

/**
 * Firestore 문서 업데이트
 */
async function updateFirestoreDocument(
  env: Env,
  accessToken: string,
  collection: string,
  docId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const projectId = env.FIREBASE_PROJECT_ID;
  const fields = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, convertToFirestoreValue(v)]),
  );

  await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}?updateMask.fieldPaths=${Object.keys(data).join('&updateMask.fieldPaths=')}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    },
  );
}

/**
 * Firestore 문서 생성
 */
async function createFirestoreDocument(
  env: Env,
  accessToken: string,
  collection: string,
  docId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const projectId = env.FIREBASE_PROJECT_ID;
  const fields = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, convertToFirestoreValue(v)]),
  );

  await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?documentId=${docId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    },
  );
}

function convertToFirestoreValue(value: unknown): unknown {
  if (value === null) return { nullValue: null };

  if (typeof value === 'string') return { stringValue: value };

  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }

  if (typeof value === 'boolean') return { booleanValue: value };

  if (value instanceof Date) return { timestampValue: value.toISOString() };

  return { stringValue: String(value) };
}

function parseFirestoreDocument(
  fields: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(fields)) {
    result[key] = parseFirestoreValue(value as Record<string, unknown>);
  }

  return result;
}

function parseFirestoreValue(value: Record<string, unknown>): unknown {
  if ('stringValue' in value) return value.stringValue;

  if ('integerValue' in value) return Number(value.integerValue);

  if ('doubleValue' in value) return value.doubleValue;

  if ('booleanValue' in value) return value.booleanValue;

  if ('nullValue' in value) return null;

  if ('timestampValue' in value) {
    const date = new Date(value.timestampValue as string);

    return { _seconds: Math.floor(date.getTime() / 1000) };
  }

  // 중첩 객체 (mapValue) 재귀 처리
  if ('mapValue' in value) {
    const mapValue = value.mapValue as { fields?: Record<string, unknown> };

    if (mapValue.fields) {
      return parseFirestoreDocument(mapValue.fields);
    }

    return {};
  }

  // 배열 (arrayValue) 재귀 처리
  if ('arrayValue' in value) {
    const arrayValue = value.arrayValue as {
      values?: Array<Record<string, unknown>>;
    };

    if (arrayValue.values) {
      return arrayValue.values.map((v) => parseFirestoreValue(v));
    }

    return [];
  }

  return value;
}

/**
 * 포트원 빌링키 결제
 * @see https://developers.portone.io/
 */
async function processBillingPayment(
  env: Env,
  billingKey: string,
  amount: number,
  paymentId: string,
  orderName: string,
): Promise<
  | {
      success: true;
      data: {
        paymentId: string;
        transactionId: string;
        amount: number;
        paidAt: string;
      };
    }
  | { success: false; error: { code: string; message: string } }
> {
  const response = await fetch(
    `https://api.portone.io/payments/${encodeURIComponent(paymentId)}/billing-key`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `PortOne ${env.PORTONE_API_SECRET}`,
      },
      body: JSON.stringify({
        billingKey,
        orderName,
        amount: {
          total: amount,
        },
        currency: 'KRW',
      }),
    },
  );

  const responseText = await response.text();

  // HTML 응답 체크
  if (
    responseText.startsWith('<!DOCTYPE') ||
    responseText.startsWith('<html')
  ) {
    return {
      success: false,
      error: { code: 'HTML_RESPONSE', message: '결제 API 응답 오류' },
    };
  }

  const data = JSON.parse(responseText) as PortonePaymentResponse;

  if (!response.ok) {
    return {
      success: false,
      error: {
        code: data.status ?? 'UNKNOWN',
        message: data.message ?? '결제 실패',
      },
    };
  }

  return {
    success: true,
    data: {
      paymentId: data.paymentId,
      transactionId: data.transactionId,
      amount: data.amount?.paid ?? amount,
      paidAt: data.paidAt ?? new Date().toISOString(),
    },
  };
}

/**
 * 구독 갱신 결제 처리
 */
async function renewSubscription(
  env: Env,
  firebaseToken: string,
  subscription: Subscription,
): Promise<boolean> {
  // 빌링키 조회
  const billingKey = (await getFirestoreDocument(
    env,
    firebaseToken,
    BILLING_KEYS_COLLECTION,
    subscription.billingKeyId,
  )) as BillingKey | null;

  if (!billingKey || !billingKey.billingKey) {
    console.error(
      `Billing key not found or deleted: ${subscription.billingKeyId}`,
    );

    await updateFirestoreDocument(
      env,
      firebaseToken,
      SUBSCRIPTIONS_COLLECTION,
      subscription.id,
      {
        status: 'payment_failed',
        lastPaymentError: '등록된 카드 정보를 찾을 수 없습니다.',
        updatedAt: new Date(),
      },
    );

    return false;
  }

  // 결제 시도
  const paymentId = `renewal_${subscription.clubId}_${Date.now()}`;
  const orderName = `${subscription.planName} 플랜 정기결제`;

  // 크레딧이 있으면 결제 금액에서 차감
  const existingCredit = subscription.credit ?? 0;
  const actualPaymentAmount = Math.max(0, subscription.price - existingCredit);
  const remainingCredit = Math.max(0, existingCredit - subscription.price);

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
          paymentId: paymentId,
          transactionId: '',
          amount: actualPaymentAmount,
          planId: subscription.planId,
          planName: subscription.planName,
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
    // 결제 성공: 구독 기간 연장 (billingCycle에 따라)
    const newEndDate = new Date(subscription.endDate._seconds * 1000);

    if (subscription.billingCycle === 'yearly') {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    } else {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    }

    // 예약된 플랜 변경이 있으면 적용
    const updateData: Record<string, unknown> = {
      endDate: newEndDate,
      retryCount: 0,
      lastPaymentError: null,
      credit: remainingCredit > 0 ? remainingCredit : null, // 남은 크레딧 저장
      updatedAt: new Date(),
    };

    if (subscription.nextPlanId) {
      updateData.planId = subscription.nextPlanId;
      updateData.planName =
        subscription.nextPlanName ?? subscription.nextPlanId;
      updateData.price = subscription.nextPlanPrice ?? subscription.price;
      // 예약 필드 초기화
      updateData.nextPlanId = null;
      updateData.nextPlanName = null;
      updateData.nextPlanPrice = null;

      console.log(
        `Applying scheduled plan change for ${subscription.id}: ${subscription.planId} -> ${subscription.nextPlanId}`,
      );
    }

    await updateFirestoreDocument(
      env,
      firebaseToken,
      SUBSCRIPTIONS_COLLECTION,
      subscription.id,
      updateData,
    );

    // 결제 기록 생성 (실제 결제가 있었을 경우에만)
    if (paymentData) {
      await createFirestoreDocument(
        env,
        firebaseToken,
        PAYMENTS_COLLECTION,
        paymentData.paymentId,
        {
          id: paymentData.paymentId,
          subscriptionId: subscription.id,
          clubId: subscription.clubId,
          userId: subscription.userId,
          userEmail: subscription.userEmail,
          paymentId: paymentData.paymentId,
          transactionId: paymentData.transactionId,
          amount: paymentData.amount,
          creditApplied: existingCredit > 0 ? existingCredit : undefined,
          planId: subscription.planId,
          planName: subscription.planName,
          status: 'success',
          paidAt: paymentData.paidAt,
          createdAt: new Date(),
        },
      );
    } else if (existingCredit > 0) {
      // 크레딧으로 전액 충당된 경우 기록
      const creditPaymentId = `credit_${subscription.clubId}_${Date.now()}`;

      await createFirestoreDocument(
        env,
        firebaseToken,
        PAYMENTS_COLLECTION,
        creditPaymentId,
        {
          id: creditPaymentId,
          subscriptionId: subscription.id,
          clubId: subscription.clubId,
          userId: subscription.userId,
          userEmail: subscription.userEmail,
          paymentId: creditPaymentId,
          transactionId: '',
          amount: 0,
          creditApplied: existingCredit,
          planId: subscription.planId,
          planName: subscription.planName,
          status: 'success',
          type: 'credit_applied',
          createdAt: new Date(),
        },
      );
    }

    console.log(`Subscription renewed: ${subscription.id}`);

    return true;
  }

  return false;
}

/**
 * 정기결제 갱신 처리 (매일 오전 9시 KST)
 */
async function processSubscriptionRenewals(env: Env): Promise<void> {
  console.log('Starting subscription renewal process...');

  const firebaseToken = await getFirebaseAccessToken(env);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );

  // 오늘 만료되는 active 구독 조회
  const subscriptions = (await queryFirestore(
    env,
    firebaseToken,
    SUBSCRIPTIONS_COLLECTION,
    [
      { field: 'status', op: 'EQUAL', value: 'active' },
      { field: 'endDate', op: 'GREATER_THAN_OR_EQUAL', value: startOfDay },
      { field: 'endDate', op: 'LESS_THAN', value: endOfDay },
    ],
  )) as Subscription[];

  console.log(`Found ${subscriptions.length} subscriptions to renew`);

  let success = 0;
  let failed = 0;

  for (const subscription of subscriptions) {
    if (subscription.price === 0) {
      console.log(`Skipping free plan: ${subscription.id}`);

      continue;
    }

    const result = await renewSubscription(env, firebaseToken, subscription);

    if (result) success++;
    else failed++;
  }

  console.log(
    `Subscription renewal complete: ${success} success, ${failed} failed`,
  );
}

/**
 * 결제 실패 재시도 (매일 오후 2시 KST)
 */
async function retryFailedPayments(env: Env): Promise<void> {
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
}

/**
 * 취소 예정 구독 만료 처리 (매일 오전 9시 KST, 갱신 처리와 함께)
 * canceledAt이 있고 endDate가 지난 구독을 FREE로 전환
 */
async function processCanceledSubscriptions(env: Env): Promise<void> {
  console.log('Starting canceled subscription expiry process...');

  const firebaseToken = await getFirebaseAccessToken(env);

  const now = new Date();

  // endDate가 지난 active 구독 조회 (canceledAt 여부는 코드에서 확인)
  const subscriptions = (await queryFirestore(
    env,
    firebaseToken,
    SUBSCRIPTIONS_COLLECTION,
    [
      { field: 'status', op: 'EQUAL', value: 'active' },
      { field: 'endDate', op: 'LESS_THAN_OR_EQUAL', value: now },
    ],
  )) as Subscription[];

  // canceledAt이 있는 구독만 필터링 (취소 예정이었던 구독)
  const canceledSubscriptions = subscriptions.filter(
    (sub) => sub.canceledAt != null,
  );

  console.log(
    `Found ${canceledSubscriptions.length} canceled subscriptions to expire`,
  );

  for (const subscription of canceledSubscriptions) {
    // 예약된 플랜 변경이 있으면 적용, 없으면 FREE로 다운그레이드
    const newPlanId = subscription.nextPlanId ?? 'FREE';
    const newPlanName = subscription.nextPlanName ?? 'Free';
    const newPrice = subscription.nextPlanPrice ?? 0;

    // 크레딧이 있었으면 로그 남기기 (환불 요청 추적용)
    if (subscription.credit && subscription.credit > 0) {
      console.log(
        `Subscription ${subscription.id} had ${subscription.credit} credit forfeited on cancellation`,
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
        price: newPrice,
        status: 'active',
        canceledAt: null, // 취소 완료되었으므로 제거
        credit: null, // 크레딧 소멸
        nextPlanId: null,
        nextPlanName: null,
        nextPlanPrice: null,
        updatedAt: new Date(),
      },
    );

    console.log(
      `Canceled subscription ${subscription.id} transitioned to ${newPlanId}`,
    );
  }

  console.log('Canceled subscription expiry process complete');
}

/**
 * 만료 구독 정리 (매주 월요일 오전 3시 KST)
 */
async function cleanupExpiredSubscriptions(env: Env): Promise<void> {
  console.log('Starting expired subscription cleanup...');

  const firebaseToken = await getFirebaseAccessToken(env);

  const thirtyDaysAgo = new Date();

  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const subscriptions = (await queryFirestore(
    env,
    firebaseToken,
    SUBSCRIPTIONS_COLLECTION,
    [
      { field: 'status', op: 'EQUAL', value: 'expired' },
      { field: 'endDate', op: 'LESS_THAN', value: thirtyDaysAgo },
    ],
  )) as Subscription[];

  console.log(`Found ${subscriptions.length} expired subscriptions to cleanup`);

  for (const subscription of subscriptions) {
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
        updatedAt: new Date(),
      },
    );

    console.log(`Downgraded to FREE: ${subscription.id}`);
  }

  console.log('Expired subscription cleanup complete');
}

export default {
  /**
   * Cron Trigger 핸들러
   */
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    const hour = new Date(event.scheduledTime).getUTCHours();
    const dayOfWeek = new Date(event.scheduledTime).getUTCDay();

    // UTC 0시 = KST 9시: 구독 갱신 + 취소된 구독 만료 처리
    if (hour === 0) {
      ctx.waitUntil(
        Promise.all([
          processSubscriptionRenewals(env),
          processCanceledSubscriptions(env),
        ]),
      );
    }
    // UTC 5시 = KST 14시: 결제 실패 재시도
    else if (hour === 5) {
      ctx.waitUntil(retryFailedPayments(env));
    }
    // UTC 일요일 18시 = KST 월요일 3시: 만료 구독 정리
    else if (hour === 18 && dayOfWeek === 0) {
      ctx.waitUntil(cleanupExpiredSubscriptions(env));
    }
  },

  /**
   * HTTP 요청 핸들러 (테스트/수동 실행용)
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 헬스체크는 인증 불필요
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    // 테스트 엔드포인트 보안 검증
    const isTestEndpoint = url.pathname.startsWith('/test/');

    if (isTestEndpoint) {
      // 프로덕션 환경에서는 테스트 엔드포인트 비활성화
      if (env.ENVIRONMENT === 'production') {
        return new Response('Forbidden', { status: 403 });
      }

      // API 키가 설정된 경우 인증 필요
      if (env.SCHEDULER_API_KEY) {
        const authHeader = request.headers.get('Authorization');
        const providedKey = authHeader?.replace('Bearer ', '');

        if (providedKey !== env.SCHEDULER_API_KEY) {
          return new Response('Unauthorized', { status: 401 });
        }
      }
    }

    if (url.pathname === '/test/renewals') {
      await processSubscriptionRenewals(env);

      return new Response('Renewal process completed', { status: 200 });
    }

    if (url.pathname === '/test/canceled') {
      await processCanceledSubscriptions(env);

      return new Response('Canceled subscription process completed', {
        status: 200,
      });
    }

    if (url.pathname === '/test/retry') {
      await retryFailedPayments(env);

      return new Response('Retry process completed', { status: 200 });
    }

    if (url.pathname === '/test/cleanup') {
      await cleanupExpiredSubscriptions(env);

      return new Response('Cleanup process completed', { status: 200 });
    }

    return new Response('Not Found', { status: 404 });
  },
};
