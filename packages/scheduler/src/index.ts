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
  // 테스트 빌링 주기 (분 단위, 선택)
  TEST_BILLING_CYCLE_MINUTES?: string;
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

/**
 * 테스트 빌링 주기 (분) 가져오기
 * - 환경변수 TEST_BILLING_CYCLE_MINUTES로 설정
 * - 설정하지 않으면 null (일반 빌링 주기 사용)
 */
function getTestBillingCycleMinutes(env: Env): number | null {
  const envValue = env.TEST_BILLING_CYCLE_MINUTES;

  if (!envValue) return null;

  const minutes = parseInt(envValue, 10);

  return isNaN(minutes) ? null : minutes;
}

/**
 * 구독 종료일 계산 (갱신용)
 * - 현재 시간 또는 기존 endDate 중 더 늦은 시간 기준으로 연장
 * - 테스트 빌링 주기 환경변수가 설정되어 있으면 해당 분 후
 * - 연간 결제: 1년 후
 * - 월간 결제: 1개월 후
 */
function calculateNewEndDate(
  currentEndDate: Date,
  billingCycle: BillingCycle,
  env: Env,
): Date {
  // 현재 시간과 기존 endDate 중 더 늦은 시간 기준
  // (endDate가 이미 지났으면 현재 시간 기준으로 연장)
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
 *
 * Google Cloud Service Account를 사용하여 OAuth2 액세스 토큰을 발급받습니다.
 * 이 토큰으로 Firestore REST API에 인증된 요청을 보낼 수 있습니다.
 *
 * ## 왜 직접 구현하는가?
 * - Cloudflare Workers는 Node.js 환경이 아니라 V8 isolates 기반
 * - google-auth-library는 Node.js fs, crypto, http 모듈에 의존하여 사용 불가
 * - Web Crypto API (crypto.subtle)를 사용하여 직접 JWT 서명 구현
 *
 * ## 인증 흐름 (RFC 7523 - JWT Bearer Grant)
 * 1. Service Account 비공개 키로 JWT 생성 및 서명
 * 2. Google OAuth2 서버에 JWT를 전송하여 액세스 토큰 교환
 * 3. 발급받은 액세스 토큰으로 Firestore API 호출
 *
 * ## 보안 고려사항
 * - FIREBASE_SERVICE_ACCOUNT_KEY는 Cloudflare Secrets에 안전하게 저장
 * - 비공개 키는 메모리에서만 처리되고 로그에 노출되지 않음
 * - 토큰 유효시간은 1시간 (Google 권장)
 * - scope는 Firestore 접근에 필요한 최소 권한만 요청
 *
 * @see https://developers.google.com/identity/protocols/oauth2/service-account
 * @see https://datatracker.ietf.org/doc/html/rfc7523
 */
async function getFirebaseAccessToken(env: Env): Promise<string> {
  // 1. Service Account JSON 파싱
  // Cloudflare Secrets에서 가져온 JSON 문자열을 파싱
  const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
  const now = Math.floor(Date.now() / 1000);

  // 2. JWT 헤더 구성
  // alg: RS256 = RSA + SHA-256 (Google이 요구하는 서명 알고리즘)
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  // 3. JWT 페이로드 (Claims) 구성
  // Google OAuth2 서버가 검증할 정보들
  const payload = {
    // iss (issuer): 토큰 발급자 - Service Account 이메일
    iss: serviceAccount.client_email,
    // sub (subject): 토큰 주체 - Service Account 이메일 (동일)
    sub: serviceAccount.client_email,
    // aud (audience): 토큰 수신자 - Google OAuth2 토큰 엔드포인트
    aud: 'https://oauth2.googleapis.com/token',
    // iat (issued at): 토큰 발급 시간 (Unix timestamp)
    iat: now,
    // exp (expiration): 토큰 만료 시간 (최대 1시간)
    exp: now + 3600,
    // scope: 요청하는 API 권한 (Firestore 읽기/쓰기)
    scope: 'https://www.googleapis.com/auth/datastore',
  };

  // 4. JWT 헤더와 페이로드를 Base64URL 인코딩
  // Base64URL: Base64에서 +를 -, /를 _로 변환하고 패딩(=) 제거
  // URL-safe하며 JWT 표준에서 요구하는 형식
  const base64UrlEncode = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

  const headerEncoded = base64UrlEncode(header);
  const payloadEncoded = base64UrlEncode(payload);

  // 5. 서명 입력 문자열 생성
  // JWT 서명은 "header.payload" 문자열에 대해 수행됨
  const signatureInput = `${headerEncoded}.${payloadEncoded}`;

  // 6. RSA-SHA256 서명 생성
  // Service Account의 비공개 키로 서명 (Google 서버가 공개 키로 검증)
  // PKCS#8: 비공개 키의 표준 형식 (PEM에서 추출)
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, // extractable: false - 키를 다시 추출할 수 없도록 (보안)
    ['sign'], // keyUsages: 서명 용도로만 사용
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signatureInput),
  );

  // 7. 서명을 Base64URL로 인코딩하여 최종 JWT 생성
  // JWT 형식: header.payload.signature
  const signatureEncoded = arrayBufferToBase64Url(signature);
  const jwt = `${signatureInput}.${signatureEncoded}`;

  // 8. Google OAuth2 서버에 JWT를 전송하여 액세스 토큰 교환
  // grant_type: JWT Bearer Grant (RFC 7523)
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();

    throw new Error(`Firebase token exchange failed: ${errorText}`);
  }

  const tokenData = (await tokenResponse.json()) as { access_token: string };

  return tokenData.access_token;
}

/**
 * PEM 형식의 비공개 키를 ArrayBuffer로 변환
 *
 * PEM (Privacy-Enhanced Mail) 형식:
 * - -----BEGIN PRIVATE KEY----- 헤더
 * - Base64로 인코딩된 키 데이터
 * - -----END PRIVATE KEY----- 푸터
 *
 * Web Crypto API는 DER(바이너리) 형식을 요구하므로
 * Base64 디코딩하여 ArrayBuffer로 변환
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  // PEM 헤더/푸터 및 공백 제거하여 순수 Base64 문자열 추출
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');

  // Base64 디코딩 → 바이너리 문자열 → Uint8Array → ArrayBuffer
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

/**
 * ArrayBuffer를 Base64URL 문자열로 변환
 *
 * Base64URL은 URL-safe한 Base64 변형:
 * - '+' → '-' (URL에서 +는 공백으로 해석됨)
 * - '/' → '_' (URL 경로 구분자와 충돌 방지)
 * - 패딩 '=' 제거 (JWT 표준)
 */
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

  const responseText = await response.text();

  if (!response.ok) {
    console.error(`Firestore query failed: ${responseText}`);

    return [];
  }

  const results = JSON.parse(responseText) as Array<{
    document?: { fields: Record<string, unknown> };
    error?: { code: number; message: string; status: string };
  }>;

  // 인덱스 필요 에러 등 확인
  const errorResult = results.find((r) => r.error);

  if (errorResult?.error) {
    console.error(`Firestore query error: ${JSON.stringify(errorResult.error)}`);

    return [];
  }

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
 *
 * null 값 처리:
 * - null 값은 필드 삭제로 처리됩니다.
 * - updateMask에는 포함하되 fields에서 제외하면 Firestore가 해당 필드를 삭제합니다.
 * - 이는 클라이언트 SDK의 deleteField()와 동일한 동작입니다.
 */
async function updateFirestoreDocument(
  env: Env,
  accessToken: string,
  collection: string,
  docId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const projectId = env.FIREBASE_PROJECT_ID;

  // null이 아닌 필드만 fields 객체에 포함 (null 필드는 삭제됨)
  const fields = Object.fromEntries(
    Object.entries(data)
      .filter(([, v]) => v !== null)
      .map(([k, v]) => [k, convertToFirestoreValue(v)]),
  );

  // 모든 필드(삭제 대상 포함)를 updateMask에 추가
  // updateMask에 있지만 fields에 없는 필드는 Firestore에서 삭제됨
  const params = new URLSearchParams();

  for (const field of Object.keys(data)) {
    params.append('updateMask.fieldPaths', field);
  }

  await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}?${params.toString()}`,
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
  // undefined와 null은 Firestore에서 필드 제거로 처리하므로 null 반환
  if (value === undefined || value === null) return { nullValue: null };

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
      // PortOne 응답에 없으면 요청 시 사용한 paymentId 사용
      paymentId: data.paymentId ?? paymentId,
      transactionId: data.transactionId ?? `txn_${paymentId}`,
      amount: data.amount?.paid ?? amount,
      paidAt: data.paidAt ?? new Date().toISOString(),
    },
  };
}

/**
 * 구독 갱신 결제 처리
 */
/**
 * 동아리의 기본 빌링키 조회
 */
async function getDefaultBillingKey(
  env: Env,
  firebaseToken: string,
  clubId: number,
): Promise<BillingKey | null> {
  const billingKeys = (await queryFirestore(env, firebaseToken, BILLING_KEYS_COLLECTION, [
    { field: 'clubId', op: 'EQUAL', value: clubId },
    { field: 'isDefault', op: 'EQUAL', value: true },
  ])) as BillingKey[];

  const defaultKey = billingKeys[0];

  if (!defaultKey || !defaultKey.billingKey) {
    return null;
  }

  return defaultKey;
}

async function renewSubscription(
  env: Env,
  firebaseToken: string,
  subscription: Subscription,
): Promise<boolean> {
  // 필수 필드 검증
  if (!subscription.id || !subscription.clubId) {
    console.error(
      `renewSubscription: Invalid subscription data - id=${subscription.id}, clubId=${subscription.clubId}`,
    );

    return false;
  }

  // 동아리의 기본 결제수단 조회 (변경된 결제수단 반영)
  const billingKey = await getDefaultBillingKey(
    env,
    firebaseToken,
    subscription.clubId,
  );

  if (!billingKey) {
    console.error(`Default billing key not found for club: ${subscription.clubId}`);

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
      // 예약 필드 초기화
      updateData.nextPlanId = null;
      updateData.nextPlanName = null;
      updateData.nextPlanPrice = null;

      console.log(
        `Downgrading to free plan for ${subscription.id}: ${subscription.planId} -> ${effectivePlanId}`,
      );
    } else {
      // 유료 플랜: 구독 기간 연장
      const currentEndDate = new Date(subscription.endDate._seconds * 1000);
      const newEndDate = calculateNewEndDate(
        currentEndDate,
        subscription.billingCycle,
        env,
      );

      updateData.endDate = newEndDate;
      updateData.credit = remainingCredit > 0 ? remainingCredit : null;

      // 예약된 플랜 변경이 있으면 적용 (이미 새 플랜 가격으로 결제됨)
      if (hasScheduledChange) {
        updateData.planId = effectivePlanId;
        updateData.planName = effectivePlanName;
        updateData.price = effectivePrice;
        // 예약 필드 초기화
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
      `Creating payment record for ${subscription.id}: paymentData=${!!paymentData}, isDowngradingToFree=${isDowngradingToFree}, existingCredit=${existingCredit}, hasScheduledChange=${hasScheduledChange}, effectivePrice=${effectivePrice}`,
    );

    let paymentRecordCreated = false;

    if (paymentData) {
      // 실제 결제가 있었을 경우
      // Document ID 유효성 검사 - undefined나 빈 문자열이면 fallback ID 생성
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

      // creditApplied는 0보다 클 때만 추가 (undefined 방지)
      if (existingCredit > 0) {
        paymentRecord.creditApplied = existingCredit;
      }

      // 플랜 변경 시 이전 플랜 정보 추가
      if (hasScheduledChange) {
        paymentRecord.previousPlanId = subscription.planId;
        paymentRecord.previousPlanName = subscription.planName;
      }

      console.log(
        `Creating payment record: ${documentId} for subscription ${subscription.id}`,
      );

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
      // 무료 플랜 다운그레이드 기록 (결제 없음, 히스토리용)
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
        console.error(`Failed to create downgrade record: ${downgradeId}`, recordError);
      }
    } else if (existingCredit > 0) {
      // 크레딧으로 전액 충당된 경우 기록
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

      // 플랜 변경 시 이전 플랜 정보 추가
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
        console.error(`Failed to create credit record: ${creditPaymentId}`, recordError);
      }
    }

    // Catch-all: 위 조건에 해당하지 않는 경우에도 갱신 기록 생성
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
        console.error(`Failed to create fallback record: ${fallbackId}`, recordError);
      }
    }

    console.log(`Subscription ${isDowngradingToFree ? 'downgraded to free' : 'renewed'}: ${subscription.id}`);

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

  console.log(`Current time: ${now.toISOString()}`);

  // 만료된 active 구독 조회 (endDate <= 현재 시간)
  // - 프로덕션: 오늘 만료된 구독 처리
  // - 테스트: 3분 빌링 주기로 만료된 구독 처리
  const subscriptions = (await queryFirestore(
    env,
    firebaseToken,
    SUBSCRIPTIONS_COLLECTION,
    [
      { field: 'status', op: 'EQUAL', value: 'active' },
      { field: 'endDate', op: 'LESS_THAN_OR_EQUAL', value: now },
    ],
  )) as Subscription[];

  console.log(`Query: status=active, endDate<=${now.toISOString()}`);

  console.log(`Found ${subscriptions.length} subscriptions to renew`);

  let success = 0;
  let failed = 0;

  for (const subscription of subscriptions) {
    // 필수 필드 검증
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

    // 취소된 구독은 자동결제하지 않음 (processCanceledSubscriptions에서 처리)
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
    // 필수 필드 검증
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
    // 필수 필드 검증
    if (!subscription.id || !subscription.clubId) {
      console.error(
        `Invalid subscription data: id=${subscription.id}, clubId=${subscription.clubId}`,
      );

      continue;
    }

    // 예약된 플랜 변경이 있으면 적용, 없으면 FREE로 다운그레이드
    const newPlanId = subscription.nextPlanId ?? 'FREE';
    const newPlanName = subscription.nextPlanName ?? 'Free';
    const newPrice = subscription.nextPlanPrice ?? 0;
    const isTransitioningToPaidPlan = newPrice > 0;

    // 크레딧 처리
    const existingCredit = subscription.credit ?? 0;

    console.log(
      `Processing canceled subscription ${subscription.id}: ${subscription.planId} -> ${newPlanId}, price=${newPrice}, credit=${existingCredit}`,
    );

    // 유료 플랜으로 전환하는 경우 결제 처리
    if (isTransitioningToPaidPlan) {
      // 빌링키 조회
      const billingKey = await getDefaultBillingKey(
        env,
        firebaseToken,
        subscription.clubId,
      );

      if (!billingKey) {
        console.error(
          `Default billing key not found for club: ${subscription.clubId}, transitioning to free instead`,
        );

        // 빌링키 없으면 무료 플랜으로 전환
        const updateData: Record<string, unknown> = {
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
        };

        await updateFirestoreDocument(
          env,
          firebaseToken,
          SUBSCRIPTIONS_COLLECTION,
          subscription.id,
          updateData,
        );

        continue;
      }

      // 크레딧 차감 계산
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

      // 결제 금액이 0보다 크면 실제 결제 진행
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
          // 결제 실패 시 무료 플랜으로 전환
          console.error(
            `Payment failed for plan change ${subscription.id}: ${result.error.message}`,
          );

          const updateData: Record<string, unknown> = {
            planId: 'FREE',
            planName: 'Free',
            price: 0,
            status: 'active',
            canceledAt: null,
            credit: existingCredit > 0 ? existingCredit : null, // 크레딧 유지
            endDate: null,
            billingCycle: null,
            nextPlanId: null,
            nextPlanName: null,
            nextPlanPrice: null,
            lastPaymentError: result.error.message,
            updatedAt: new Date(),
          };

          await updateFirestoreDocument(
            env,
            firebaseToken,
            SUBSCRIPTIONS_COLLECTION,
            subscription.id,
            updateData,
          );

          // 실패 기록 생성
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

          continue;
        }
      } else {
        // 크레딧으로 전액 충당 - 결제 없이 성공 처리
        paymentSuccess = true;
        console.log(
          `Plan change ${subscription.id} covered by credit (no payment needed)`,
        );
      }

      if (paymentSuccess) {
        // 새 빌링 주기 시작일 계산
        const newEndDate = calculateNewEndDate(
          new Date(),
          subscription.billingCycle,
          env,
        );

        const updateData: Record<string, unknown> = {
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
        };

        await updateFirestoreDocument(
          env,
          firebaseToken,
          SUBSCRIPTIONS_COLLECTION,
          subscription.id,
          updateData,
        );

        // 결제 기록 생성
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
    } else {
      // 무료 플랜으로 전환
      if (existingCredit > 0) {
        console.log(
          `Subscription ${subscription.id} had ${existingCredit} credit forfeited on cancellation to free`,
        );
      }

      const updateData: Record<string, unknown> = {
        planId: newPlanId,
        planName: newPlanName,
        price: newPrice,
        status: 'active',
        canceledAt: null,
        credit: null, // 무료 플랜 전환 시 크레딧 소멸
        endDate: null,
        billingCycle: null,
        nextPlanId: null,
        nextPlanName: null,
        nextPlanPrice: null,
        updatedAt: new Date(),
      };

      await updateFirestoreDocument(
        env,
        firebaseToken,
        SUBSCRIPTIONS_COLLECTION,
        subscription.id,
        updateData,
      );

      // 히스토리 기록 생성
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
    }
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
    // 필수 필드 검증
    if (!subscription.id || !subscription.clubId) {
      console.error(
        `Invalid subscription data: id=${subscription.id}, clubId=${subscription.clubId}`,
      );

      continue;
    }

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
    // 테스트 빌링 주기가 설정된 경우: 매분 모든 작업 실행
    if (env.TEST_BILLING_CYCLE_MINUTES) {
      console.log(
        `Test billing cycle mode (${env.TEST_BILLING_CYCLE_MINUTES}min): running all scheduled tasks`,
      );
      ctx.waitUntil(
        Promise.all([
          processSubscriptionRenewals(env),
          processCanceledSubscriptions(env),
          retryFailedPayments(env),
        ]),
      );

      return;
    }

    // 일반 모드: 특정 시간에만 실행
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

        // Bearer 토큰 형식 검증 및 추출
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response('Unauthorized', { status: 401 });
        }

        const providedKey = authHeader.slice(7); // 'Bearer '.length === 7

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
