/**
 * Firebase 인증 및 Firestore 작업
 *
 * Cloudflare Workers 환경에서 Firebase Admin SDK 대신
 * REST API를 직접 사용하여 Firestore에 접근합니다.
 */

import type { Env } from './types';

// ===== Firebase 인증 =====

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
 * @see https://developers.google.com/identity/protocols/oauth2/service-account
 * @see https://datatracker.ietf.org/doc/html/rfc7523
 */
export const getFirebaseAccessToken = async (env: Env): Promise<string> => {
  const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  };

  const base64UrlEncode = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

  const headerEncoded = base64UrlEncode(header);
  const payloadEncoded = base64UrlEncode(payload);
  const signatureInput = `${headerEncoded}.${payloadEncoded}`;

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
};

/**
 * PEM 형식의 비공개 키를 ArrayBuffer로 변환
 */
const pemToArrayBuffer = (pem: string): ArrayBuffer => {
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
};

/**
 * ArrayBuffer를 Base64URL 문자열로 변환
 */
const arrayBufferToBase64Url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

// ===== Firestore 작업 =====

/**
 * Firestore 문서 조회 (REST API)
 */
export const queryFirestore = async (
  env: Env,
  accessToken: string,
  collection: string,
  filters: Array<{ field: string; op: string; value: unknown }>,
): Promise<unknown[]> => {
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

  const errorResult = results.find((r) => r.error);

  if (errorResult?.error) {
    console.error(`Firestore query error: ${JSON.stringify(errorResult.error)}`);

    return [];
  }

  return results
    .filter((r) => r.document)
    .map((r) => parseFirestoreDocument(r.document!.fields));
};

/**
 * Firestore 문서 가져오기
 */
export const getFirestoreDocument = async (
  env: Env,
  accessToken: string,
  collection: string,
  docId: string,
): Promise<unknown | null> => {
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
};

/**
 * Firestore 문서 업데이트
 *
 * null 값 처리:
 * - null 값은 필드 삭제로 처리됩니다.
 * - updateMask에는 포함하되 fields에서 제외하면 Firestore가 해당 필드를 삭제합니다.
 */
export const updateFirestoreDocument = async (
  env: Env,
  accessToken: string,
  collection: string,
  docId: string,
  data: Record<string, unknown>,
): Promise<void> => {
  const projectId = env.FIREBASE_PROJECT_ID;

  const fields = Object.fromEntries(
    Object.entries(data)
      .filter(([, v]) => v !== null)
      .map(([k, v]) => [k, convertToFirestoreValue(v)]),
  );

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
};

/**
 * Firestore 문서 생성
 */
export const createFirestoreDocument = async (
  env: Env,
  accessToken: string,
  collection: string,
  docId: string,
  data: Record<string, unknown>,
): Promise<void> => {
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
};

// ===== 값 변환 헬퍼 =====

const convertToFirestoreValue = (value: unknown): unknown => {
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
};

const parseFirestoreDocument = (
  fields: Record<string, unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(fields)) {
    result[key] = parseFirestoreValue(value as Record<string, unknown>);
  }

  return result;
};

const parseFirestoreValue = (value: Record<string, unknown>): unknown => {
  if ('stringValue' in value) return value.stringValue;

  if ('integerValue' in value) return Number(value.integerValue);

  if ('doubleValue' in value) return value.doubleValue;

  if ('booleanValue' in value) return value.booleanValue;

  if ('nullValue' in value) return null;

  if ('timestampValue' in value) {
    return new Date(value.timestampValue as string);
  }

  if ('mapValue' in value) {
    const mapValue = value.mapValue as { fields?: Record<string, unknown> };

    if (mapValue.fields) {
      return parseFirestoreDocument(mapValue.fields);
    }

    return {};
  }

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
};
