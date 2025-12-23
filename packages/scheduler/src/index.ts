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
  startDate: { _seconds: number };
  endDate: { _seconds: number };
  retryCount?: number;
  lastPaymentError?: string;
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
      error: { code: data.status ?? 'UNKNOWN', message: data.message ?? '결제 실패' },
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

  const result = await processBillingPayment(
    env,
    billingKey.billingKey,
    subscription.price,
    paymentId,
    orderName,
  );

  if (result.success) {
    // 결제 성공: 구독 기간 연장
    const newEndDate = new Date(subscription.endDate._seconds * 1000);

    newEndDate.setMonth(newEndDate.getMonth() + 1);

    await updateFirestoreDocument(
      env,
      firebaseToken,
      SUBSCRIPTIONS_COLLECTION,
      subscription.id,
      {
        endDate: newEndDate,
        retryCount: 0,
        lastPaymentError: null,
        updatedAt: new Date(),
      },
    );

    // 결제 기록 생성
    await createFirestoreDocument(
      env,
      firebaseToken,
      PAYMENTS_COLLECTION,
      result.data.paymentId,
      {
        id: result.data.paymentId,
        subscriptionId: subscription.id,
        clubId: subscription.clubId,
        userId: subscription.userId,
        userEmail: subscription.userEmail,
        paymentId: result.data.paymentId,
        transactionId: result.data.transactionId,
        amount: result.data.amount,
        planId: subscription.planId,
        planName: subscription.planName,
        status: 'success',
        paidAt: result.data.paidAt,
        createdAt: new Date(),
      },
    );

    console.log(`Subscription renewed: ${subscription.id}`);

    return true;
  } else {
    // 결제 실패: 재시도 카운트 증가
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
        amount: subscription.price,
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

    // UTC 0시 = KST 9시: 구독 갱신
    if (hour === 0) {
      ctx.waitUntil(processSubscriptionRenewals(env));
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

    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    if (url.pathname === '/test/renewals' && env.ENVIRONMENT !== 'production') {
      await processSubscriptionRenewals(env);

      return new Response('Renewal process completed', { status: 200 });
    }

    if (url.pathname === '/test/retry' && env.ENVIRONMENT !== 'production') {
      await retryFailedPayments(env);

      return new Response('Retry process completed', { status: 200 });
    }

    if (url.pathname === '/test/cleanup' && env.ENVIRONMENT !== 'production') {
      await cleanupExpiredSubscriptions(env);

      return new Response('Cleanup process completed', { status: 200 });
    }

    return new Response('Not Found', { status: 404 });
  },
};
