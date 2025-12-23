# 결제 플로우 문서

## 개요

이 문서는 우학동 프론트엔드의 구독 결제 시스템 플로우를 설명합니다.

---

## 아키텍처

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   BillingClient │────▶│  PortOne SDK    │────▶│   PG사 (이니시스)  │
│   (프론트엔드)    │     │  (빌링키 발급)    │     │   카카오페이 등    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Firebase       │────▶│  /api/portone   │
│  (구독/결제 저장) │     │  (빌링키 결제)    │
└─────────────────┘     └─────────────────┘
```

---

## 데이터 모델

### Subscription (구독)

```typescript
type Subscription = {
  id: string;
  clubId: number;
  userId: string;
  userEmail: string;
  planId: string;           // 'FREE' | 'STANDARD' | 'PRO' | 'ENTERPRISE'
  planName: string;
  price: number;
  status: SubscriptionStatus; // 'active' | 'canceled' | 'expired' | 'pending'
  startDate: Timestamp;
  endDate: Timestamp;       // 다음 결제일 또는 이용 종료일
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // 예약된 플랜 변경 (다음 결제일에 적용)
  nextPlanId?: string;
  nextPlanName?: string;
  nextPlanPrice?: number;
};
```

### BillingKey (결제수단)

```typescript
type BillingKey = {
  id: string;
  clubId: number;
  userId: string;
  userEmail: string;
  billingKey: string;       // PortOne 빌링키
  customerKey: string;
  cardCompany: string;      // '신한카드', '카카오페이' 등
  cardNumber: string;       // 마스킹된 카드번호
  isDefault: boolean;       // 기본 결제수단 여부
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

---

## 결제 시나리오

### 1. 신규 유료 구독 (무료 → 유료)

```
사용자가 FREE 플랜에서 STANDARD 플랜 선택
         │
         ▼
┌─────────────────────────────────┐
│ 결제수단 있음?                    │
│   YES → ConfirmStep (결제 확인)  │
│   NO  → SelectCardStep (등록)   │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ PortOne 빌링키로 즉시 결제        │
│ POST /api/portone/billing       │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Firebase에 구독 생성             │
│ createSubscriptionWithBillingKey│
│ - status: 'active'              │
│ - endDate: 1개월 후              │
└─────────────────────────────────┘
         │
         ▼
    SuccessStep
    "플랜이 변경되었습니다!"
```

### 2. 플랜 업그레이드 (유료 → 더 비싼 유료)

```
STANDARD(10,000원) 플랜 사용자가 PRO(20,000원) 플랜 선택
(결제 주기 30일 중 15일 사용)
         │
         ▼
┌─────────────────────────────────┐
│ 비례 정산(Proration) 계산         │
│ calculateProration()            │
│ - remainingDays: 15             │
│ - currentPlanCredit: 5,000원    │
│   (10,000 × 15/30)              │
│ - newPlanCost: 10,000원         │
│   (20,000 × 15/30)              │
│ - amountDue: 5,000원            │
│   (10,000 - 5,000)              │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ ConfirmStep에서 비례 정산 표시    │
│ - Pro 플랜 (15일): 10,000원     │
│ - Standard 미사용 크레딧: -5,000원│
│ - 오늘 결제 금액: 5,000원         │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 즉시 비례 정산 금액 결제          │
│ POST /api/portone/billing       │
│ - amount: 5,000원 (prorated)    │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 플랜 즉시 변경                   │
│ upgradePlan()                   │
│ - planId: 'PRO' (즉시 적용)     │
│ - endDate 유지 (결제 주기 동일)  │
└─────────────────────────────────┘
         │
         ▼
    SuccessStep
    "Pro 플랜으로 변경되었습니다!"
```

**장점**: 사용자가 즉시 업그레이드된 플랜 사용 가능, 공정한 비용 청구

### 2-1. 플랜 다운그레이드 (유료 → 더 싼 유료)

```
PRO 플랜 사용자가 STANDARD 플랜 선택
         │
         ▼
┌─────────────────────────────────┐
│ 다운그레이드 감지                 │
│ newPrice < currentPrice         │
│ proration.isUpgrade === false   │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 다음 결제일에 플랜 변경 예약       │
│ schedulePlanChange()            │
│ - nextPlanId: 'STANDARD'        │
│ - nextPlanName: 'Standard'      │
│ - nextPlanPrice: 10000          │
└─────────────────────────────────┘
         │
         ▼
    SuccessStep
    "플랜 변경이 예약되었습니다!"
    "2024년 2월 15일부터 Standard 플랜으로 변경됩니다."
```

**이유**: 이미 더 비싼 플랜에 대해 결제했으므로 현재 기간 동안은 현재 플랜 유지

### 3. 구독 취소

```
사용자가 "구독 취소" 클릭
         │
         ▼
┌─────────────────────────────────┐
│ CancelSubscriptionModal 표시    │
│ "정말 취소하시겠습니까?"          │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ cancelSubscription()            │
│ - status: 'canceled'            │
│ - endDate 유지 (만료일까지 이용)  │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ OverviewTab에 안내 표시          │
│ "구독이 취소되었습니다.           │
│  2024년 2월 15일까지             │
│  현재 플랜을 이용하실 수 있습니다" │
└─────────────────────────────────┘
```

### 4. 예약된 플랜 변경 취소

```
사용자가 "예약 취소" 클릭
         │
         ▼
┌─────────────────────────────────┐
│ cancelScheduledPlanChange()     │
│ - nextPlanId 삭제               │
│ - nextPlanName 삭제             │
│ - nextPlanPrice 삭제            │
└─────────────────────────────────┘
         │
         ▼
    현재 플랜 유지
```

### 5. 구독 취소 후 재구독

취소된 구독이 만료되기 전에 다시 유료 플랜으로 전환하는 경우

#### 5-1. 같은 플랜 재구독

```
취소된 Standard 플랜에서 다시 Standard 선택
         │
         ▼
┌─────────────────────────────────┐
│ 같은 플랜 감지                   │
│ plan.id === currentPlanId       │
│ subscription.status === 'canceled' │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ reactivateSubscription()        │
│ - status: 'active'              │
│ - nextPlanId/Name/Price 삭제    │
│ - 추가 결제 없음 (이미 결제됨)    │
└─────────────────────────────────┘
         │
         ▼
    SuccessStep
    "구독이 재활성화되었습니다!"
```

#### 5-2. 다른 유료 플랜으로 변경 (업그레이드)

```
취소된 Standard(10,000원) 플랜에서 Pro(20,000원) 선택
(결제 주기 30일 중 15일 남음)
         │
         ▼
┌─────────────────────────────────┐
│ 비례 정산(Proration) 계산         │
│ - 취소된 구독도 만료 전이면 계산  │
│ - remainingDays: 15             │
│ - amountDue: 5,000원            │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 비례 정산 금액 결제              │
│ POST /api/portone/billing       │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ upgradePlan()                   │
│ - planId: 'PRO'                 │
│ - status: 'active' (재활성화)   │
│ - endDate 유지                  │
└─────────────────────────────────┘
         │
         ▼
    SuccessStep
    "Pro 플랜으로 변경되었습니다!"
```

#### 5-3. 다른 유료 플랜으로 변경 (다운그레이드)

```
취소된 Pro(20,000원) 플랜에서 Standard(10,000원) 선택
         │
         ▼
┌─────────────────────────────────┐
│ 다운그레이드 감지                 │
│ newPrice < currentPrice         │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ schedulePlanChange()            │
│ - nextPlanId: 'STANDARD'        │
│ - status: 'active' (재활성화)   │
│ - 다음 결제일에 플랜 변경         │
└─────────────────────────────────┘
         │
         ▼
    SuccessStep
    "플랜 변경이 예약되었습니다!"
```

**요약:**

| 재구독 케이스 | 처리 방식 | 결제 |
|-------------|----------|------|
| 같은 플랜 | `reactivateSubscription()` | 없음 |
| 업그레이드 | `upgradePlan()` | 비례 정산 |
| 다운그레이드 | `schedulePlanChange()` | 없음 (예약) |

---

## 결제수단 관리

### 결제수단 등록 플로우

```
┌─────────────────────────────────┐
│ SelectCardStep                  │
│ - 신용/체크카드 (KG이니시스)      │
│ - 카카오페이                     │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ PortOne SDK 호출                │
│ requestIssueBillingKey()        │
│ - storeId                       │
│ - channelKey (PG사별)           │
│ - billingKeyMethod              │
│   - 'CARD' (카드)               │
│   - 'EASY_PAY' (간편결제)        │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ PG사 결제창 표시                 │
│ 사용자가 카드 정보 입력           │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Firebase에 빌링키 저장           │
│ saveBillingKey()                │
│ - isDefault: true (새 카드)     │
│ - 기존 기본카드 isDefault: false │
└─────────────────────────────────┘
```

### 다중 결제수단

- 여러 결제수단 등록 가능
- `isDefault: true`인 카드가 기본 결제수단
- PaymentMethodsTab에서 기본 카드 변경 가능
- ConfirmStep에서 결제할 카드 선택 가능

---

## 주요 Firebase 함수

| 함수 | 설명 |
|------|------|
| `getCurrentSubscription(clubId)` | 현재 구독 조회 (우선순위: 활성유료 → 취소됨+미만료 → 활성무료) |
| `getActiveSubscription(clubId)` | 활성 구독만 조회 |
| `createSubscriptionWithBillingKey()` | 빌링키로 유료 구독 생성 |
| `createFreeSubscription()` | 무료 구독 생성 |
| `cancelSubscription(subscriptionId)` | 구독 취소 (status → 'canceled') |
| `reactivateSubscription(subscriptionId)` | 취소된 구독 재활성화 (status → 'active') |
| `upgradePlan()` | 즉시 플랜 업그레이드 (비례 정산, status → 'active') |
| `schedulePlanChange()` | 다음 결제일 플랜 변경 예약 (status → 'active') |
| `cancelScheduledPlanChange()` | 예약된 플랜 변경 취소 |
| `getBillingKeys(clubId)` | 모든 결제수단 조회 |
| `saveBillingKey()` | 결제수단 저장 |
| `deleteBillingKey()` | 결제수단 삭제 |
| `setDefaultBillingKey()` | 기본 결제수단 변경 |

---

## API 엔드포인트

### POST /api/portone/billing

빌링키로 결제 요청

**Request:**
```json
{
  "billingKey": "billing_xxx",
  "paymentId": "payment_xxx",
  "orderName": "Standard 플랜 월간 구독",
  "amount": 10000,
  "customer": {
    "id": "user_uid",
    "name": "홍길동",
    "email": "user@example.com",
    "phoneNumber": "010-1234-5678"
  }
}
```

**Response:**
```json
{
  "paymentId": "payment_xxx",
  "transactionId": "tx_xxx",
  "status": "PAID",
  "amount": 10000
}
```

---

## UI 컴포넌트

### BillingClient

메인 결제 관리 컴포넌트

- **Tabs**: 오버뷰 | 결제수단 | 결제내역 | 요금제

### Modal Steps

| Step | 설명 |
|------|------|
| `SelectCardStep` | 결제수단 선택/등록 |
| `ConfirmStep` | 결제 확인 (플랜 정보, 결제수단 선택) |
| `ProcessingStep` | 결제 처리 중 |
| `SuccessStep` | 완료 (즉시 변경 / 예약 변경) |
| `ErrorStep` | 에러 표시 |

### OverviewTab 상태 표시

| 상태 | 뱃지 | 안내 |
|------|------|------|
| 활성 | `활성` | - |
| 취소됨 (미만료) | `취소 완료` | "구독이 취소되었습니다. **날짜**까지 이용 가능" |
| 플랜 변경 예약됨 | `활성` | "**날짜**부터 **플랜명** 플랜으로 변경됩니다" |

### PlansTab 상태 표시

| 상태 | 표시 |
|------|------|
| 현재 플랜 | `현재 플랜` 뱃지, 버튼 숨김 |
| 취소 후 무료 전환 예정 | FREE 플랜에 `전환 예정` 뱃지 + 버튼 비활성화 |
| 취소된 현재 플랜 | `현재 플랜` 뱃지 + `재구독` 버튼 활성화 |
| 취소 상태에서 다른 유료 플랜 | `플랜 변경` 버튼 활성화 |

---

## 환경 변수

```env
# PortOne
NEXT_PUBLIC_PORTONE_STORE_ID=store_xxx
NEXT_PUBLIC_PORTONE_CHANNEL_INICIS_BILLING=channel_xxx
NEXT_PUBLIC_PORTONE_CHANNEL_KAKAOPAY_BILLING=channel_xxx
PORTONE_API_SECRET=secret_xxx  # 서버에서만 사용
```

---

## 정기결제 스케줄러

> `packages/scheduler` (Cloudflare Workers)

### 스케줄러와 클라이언트 역할 분담

| 플랜 변경 유형 | 처리 주체 | 시점 |
|--------------|----------|------|
| 업그레이드 | **클라이언트** (`upgradePlan`) | 즉시 |
| 다운그레이드 | **스케줄러** (`renewSubscription`) | 다음 결제일 |
| 구독 취소 후 만료 | **스케줄러** (`processCanceledSubscriptions`) | 만료일 |
| 정기 결제 갱신 | **스케줄러** (`renewSubscription`) | 매일 09:00 KST |

### Cron 스케줄

| 시간 (KST) | UTC | 작업 |
|-----------|-----|------|
| 매일 09:00 | 00:00 | 구독 갱신 + 취소된 구독 만료 처리 |
| 매일 14:00 | 05:00 | 결제 실패 재시도 |
| 월요일 03:00 | 일요일 18:00 | 만료 구독 정리 (FREE 다운그레이드) |

---

### 1. 구독 갱신 (`processSubscriptionRenewals`)

```
┌─────────────────────────────────┐
│ status === 'active'             │
│ endDate === 오늘                │
│ price > 0 (무료 플랜 제외)       │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 빌링키로 결제 요청               │
│ processBillingPayment()         │
└─────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
 성공 ▼      실패 ▼
┌────────┐  ┌────────────────────┐
│endDate │  │ retryCount++       │
│+1개월  │  │ 3회 실패 → expired │
└────────┘  └────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ nextPlanId 있음?                │
│                                 │
│ YES → 다운그레이드 적용          │
│   - planId = nextPlanId         │
│   - price = nextPlanPrice       │
│   - nextPlan* 필드 초기화        │
│                                 │
│ NO → 현재 플랜 유지              │
└─────────────────────────────────┘
```

**예시: Pro → Standard 다운그레이드**
```
1. 사용자가 Pro 구독 중 Standard로 다운그레이드 요청
2. 클라이언트에서 schedulePlanChange() 호출
   - nextPlanId: 'STANDARD'
   - nextPlanName: 'Standard'
   - nextPlanPrice: 10000
3. (다음 결제일) 스케줄러가 갱신 처리
4. 결제 성공 시 Pro 가격으로 결제 후:
   - planId: 'STANDARD'로 변경
   - price: 10000으로 변경
   - 사용자는 다음 주기부터 Standard 플랜 이용
```

---

### 2. 취소된 구독 처리 (`processCanceledSubscriptions`)

```
┌─────────────────────────────────┐
│ status === 'canceled'           │
│ endDate <= 오늘                 │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ nextPlanId 있음?                │
│                                 │
│ YES → 예약된 플랜으로 변경       │
│   - planId = nextPlanId         │
│   - status = 'active'           │
│                                 │
│ NO → FREE 플랜으로 다운그레이드  │
│   - planId = 'FREE'             │
│   - price = 0                   │
│   - status = 'active'           │
└─────────────────────────────────┘
```

**예시: 구독 취소 후 만료**
```
1. 1월 15일: 사용자가 Standard 구독 취소
   - status: 'canceled'
   - endDate: 2월 14일 (기존 유지)
2. 2월 14일까지: Standard 플랜 계속 이용 가능
3. 2월 15일: 스케줄러가 만료 처리
   - planId: 'FREE'
   - status: 'active'
```

---

### 3. 결제 실패 재시도 (`retryFailedPayments`)

```
┌─────────────────────────────────┐
│ status === 'payment_failed'     │
│ retryCount < 3                  │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 빌링키로 결제 재시도             │
└─────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
 성공 ▼      실패 ▼
┌────────┐  ┌────────────────────┐
│status  │  │ retryCount++       │
│='active'│  │                   │
│endDate │  │ 3회 실패 시:       │
│+1개월  │  │ status = 'expired' │
└────────┘  └────────────────────┘
```

---

### 4. 만료 구독 정리 (`cleanupExpiredSubscriptions`)

```
┌─────────────────────────────────┐
│ status === 'expired'            │
│ endDate < 30일 전               │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ FREE 플랜으로 다운그레이드       │
│ - planId: 'FREE'                │
│ - price: 0                      │
│ - status: 'active'              │
└─────────────────────────────────┘
```

---

### 업그레이드는 스케줄러가 처리하지 않음

**중요**: 업그레이드(저가 → 고가)는 즉시 적용되므로 스케줄러가 관여하지 않습니다.

```
┌─────────────────────────────────┐
│ 클라이언트에서 즉시 처리         │
│                                 │
│ 1. calculateProration() 호출   │
│ 2. 비례 정산 금액 결제           │
│ 3. upgradePlan() 호출          │
│    - planId 즉시 변경           │
│    - endDate 유지 (주기 동일)   │
└─────────────────────────────────┘
```

---

### 환경 변수

```bash
# Cloudflare Workers Secrets
wrangler secret put PORTONE_API_SECRET
wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY
wrangler secret put FIREBASE_PROJECT_ID
wrangler secret put SCHEDULER_API_KEY  # 테스트 엔드포인트 인증 (선택)
wrangler secret put ENVIRONMENT       # 'production' 또는 'development'
```

### 테스트 엔드포인트

| 엔드포인트 | 설명 |
|-----------|------|
| `GET /health` | 헬스체크 (인증 불필요) |
| `GET /test/renewals` | 구독 갱신 수동 실행 |
| `GET /test/canceled` | 취소 구독 처리 수동 실행 |
| `GET /test/retry` | 결제 실패 재시도 수동 실행 |
| `GET /test/cleanup` | 만료 구독 정리 수동 실행 |

**보안:**
- `ENVIRONMENT === 'production'`이면 `/test/*` 엔드포인트 **403 Forbidden**
- 개발 환경에서도 `SCHEDULER_API_KEY` 설정 시 Bearer 인증 필요
  ```bash
  curl -H "Authorization: Bearer YOUR_API_KEY" \
       https://scheduler.example.com/test/renewals
  ```

### 배포 및 설정

스케줄러 배포, 로컬 개발, 트러블슈팅에 대한 자세한 내용은 **[packages/scheduler/README.md](../packages/scheduler/README.md)** 참고

```bash
# 빠른 배포
cd packages/scheduler
pnpm wrangler login  # 최초 1회
pnpm deploy
```

---

## 비례 정산 (Proration)

> `apps/web/src/app/payment/_helpers/utils/proration.ts`

### 계산 방식

업그레이드 시 남은 기간에 대해 비례 정산:

```typescript
// 예시: Standard(10,000원) → Pro(20,000원), 30일 중 15일 남음
const result = calculateProration({
  currentPlanPrice: 10000,  // 현재 플랜 월 가격
  newPlanPrice: 20000,      // 새 플랜 월 가격
  billingStartDate: new Date('2024-01-01'),
  billingEndDate: new Date('2024-01-31'),
});

// 결과 (1월 16일에 변경 시):
// - remainingDays: 15
// - currentPlanCredit: 5,000원 (현재 플랜 미사용 크레딧)
// - newPlanCost: 10,000원 (새 플랜 15일 비용)
// - amountDue: 5,000원 (실제 청구 금액)
// - isUpgrade: true
```

### 적용 규칙

| 변경 유형 | 적용 시점 | 결제 |
|----------|---------|------|
| 업그레이드 (저가 → 고가) | 즉시 | 비례 정산 금액 |
| 다운그레이드 (고가 → 저가) | 다음 결제일 | 없음 |
| 무료 → 유료 | 즉시 | 전액 |
| 유료 → 무료 | 다음 결제일 | 없음 |

---

## 주의사항

1. **phoneNumber 필수**: PortOne(KG이니시스)에서 전화번호 필수
2. **Mock 모드**: `NEXT_PUBLIC_IS_MOCK=true`로 테스트 가능
3. **Z-Index**: PortOne 결제창과 Dialog 충돌 → Dialog 먼저 닫고 SDK 호출
4. **스케줄러 배포**: 프론트엔드와 별도로 `packages/scheduler`에서 `wrangler deploy`
