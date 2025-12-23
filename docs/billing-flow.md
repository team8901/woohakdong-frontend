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
type BillingCycle = 'monthly' | 'yearly';

type Subscription = {
  id: string;
  clubId: number;
  userId: string;
  userEmail: string;
  planId: string;           // 'FREE' | 'STANDARD' | 'PRO' | 'ENTERPRISE'
  planName: string;
  price: number;            // 실제 결제 금액 (월간이면 월 가격, 연간이면 연 가격)
  billingCycle: BillingCycle; // 결제 주기
  status: SubscriptionStatus; // 'active' | 'canceled' | 'expired' | 'pending'
  startDate: Timestamp;
  endDate: Timestamp;       // 다음 결제일 또는 이용 종료일
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // 구독 취소 시점 (취소 예정 상태, endDate까지 이용 가능)
  canceledAt?: Timestamp;
  // 예약된 플랜 변경 (다음 결제일에 적용)
  nextPlanId?: string;
  nextPlanName?: string;
  nextPlanPrice?: number;
  // 빌링 주기 변경 시 남은 크레딧 (다음 결제에서 차감)
  credit?: number;
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

---

## 빌링 주기 변경 시나리오

### 3. 월간 → 연간 변경 (같은 플랜)

```
Standard 월간(29,000원) 사용자가 Standard 연간(288,000원) 선택
(월간 30일 중 15일 사용)
         │
         ▼
┌─────────────────────────────────┐
│ 빌링 주기 변경 감지              │
│ currentBillingCycle !== newBillingCycle │
│ proration.isBillingCycleChange = true   │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 비례 정산 계산 (빌링 주기 변경)   │
│ - currentPlanCredit: 14,500원   │
│   (29,000 × 15/30, 남은 기간 환불)│
│ - newPlanCost: 288,000원        │
│   (연간 첫 결제 전액)             │
│ - amountDue: 273,500원          │
│   (288,000 - 14,500)            │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ ConfirmStep 표시                │
│ - Standard 플랜 (연간): 288,000원│
│ - 기존 구독 크레딧: -14,500원    │
│ - 오늘 결제 금액: 273,500원      │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 즉시 결제 + 새 빌링 주기 시작     │
│ upgradePlan()                   │
│ - billingCycle: 'yearly'        │
│ - startDate: 오늘               │
│ - endDate: 1년 후               │
└─────────────────────────────────┘
```

### 4. 연간 → 월간 변경 (다운그레이드 포함)

```
Standard 연간(288,000원) 사용자가 Pro 월간(49,000원) 선택
(연간 365일 중 90일 사용, 275일 남음)
         │
         ▼
┌─────────────────────────────────┐
│ 빌링 주기 변경 감지              │
│ proration.isBillingCycleChange = true   │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 비례 정산 계산                   │
│ - currentPlanCredit: 217,000원  │
│   (288,000 × 275/365)           │
│ - newPlanCost: 49,000원         │
│   (월간 첫 결제 전액)             │
│ - amountDue: 0원                │
│ - remainingCredit: 168,000원    │
│   (다음 결제에서 차감)            │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ ConfirmStep 표시                │
│ - Pro 플랜 (월간): 49,000원     │
│ - 기존 구독 크레딧: -217,000원   │
│ - 오늘 결제 금액: 무료           │
│                                 │
│ 💰 남은 크레딧 168,000원은       │
│    다음 결제에서 자동 차감됩니다  │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 즉시 플랜 변경 + 크레딧 저장      │
│ upgradePlan()                   │
│ - billingCycle: 'monthly'       │
│ - credit: 168,000               │
│ - startDate: 오늘               │
│ - endDate: 1개월 후             │
└─────────────────────────────────┘
```

**중요**: 빌링 주기가 변경되면 다운그레이드여도 즉시 처리됩니다 (새로운 빌링 주기 시작).

### 5. 크레딧이 있는 상태에서 플랜 변경

```
Standard 월간(29,000원) + 크레딧 50,000원 → Pro 월간(49,000원)
         │
         ▼
┌─────────────────────────────────┐
│ 비례 정산 계산 (크레딧 포함)      │
│ - currentPlanCredit: 14,500원   │
│ - existingCredit: 50,000원      │
│ - totalCredit: 64,500원         │
│ - newPlanCost: 24,500원 (15일분)│
│ - amountDue: 0원                │
│ - remainingCredit: 40,000원     │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ ConfirmStep 표시                │
│ - Pro 플랜 (15일): 24,500원     │
│ - 기존 구독 크레딧: -14,500원    │
│ - 보유 크레딧: -50,000원         │
│ - 오늘 결제 금액: 무료           │
│                                 │
│ 💰 남은 크레딧 40,000원은        │
│    다음 결제에서 자동 차감됩니다  │
└─────────────────────────────────┘
```

---

## 구독 취소 시나리오

### 6. 구독 취소 (Soft Cancel)

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
│ - canceledAt: 현재 시간 (취소 예정)│
│ - status: 'active' 유지!        │
│ - endDate 유지 (만료일까지 이용)  │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ OverviewTab에 안내 표시          │
│ Badge: "취소 예정"               │
│ "구독 취소가 예약되었습니다.      │
│  2024년 2월 15일까지             │
│  현재 플랜을 이용하실 수 있습니다" │
│                                 │
│ [구독 유지하기] 버튼              │
└─────────────────────────────────┘
```

**핵심**: `canceledAt` 필드만 설정하고 `status`는 `active` 유지. `endDate`까지 정상 이용 가능.

### 6-1. 크레딧이 있는 상태에서 구독 취소

```
Standard 월간 + 크레딧 50,000원 → 취소
         │
         ▼
┌─────────────────────────────────┐
│ OverviewTab에 안내 표시          │
│ Badge: "취소 예정"               │
│                                 │
│ ⚠️ 50,000원의 크레딧이 있습니다.  │
│    구독 종료 시 크레딧은 소멸됩니다.│
│                                 │
│ [환불 문의하기] → 이메일 발송     │
└─────────────────────────────────┘
         │
         ▼ (endDate 도달 시)
┌─────────────────────────────────┐
│ 스케줄러: processCanceledSubscriptions │
│ - status: 'expired'             │
│ - credit: null (소멸)           │
│ - FREE 플랜으로 다운그레이드     │
└─────────────────────────────────┘
```

### 6-2. 취소 예정 상태에서 다른 플랜 구독

```
취소 예정 Standard → Pro 선택
         │
         ▼
┌─────────────────────────────────┐
│ 업그레이드 처리                  │
│ upgradePlan() 또는              │
│ schedulePlanChange()            │
│                                 │
│ - canceledAt: 삭제 (취소 철회)  │
│ - status: 'active' 유지         │
└─────────────────────────────────┘
```

**핵심**: 취소 예정 상태에서 다른 플랜으로 변경하면 `canceledAt`이 제거되어 정상 구독 상태로 복귀.

### 7. 예약된 플랜 변경 취소

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

### ConfirmStep 모드

| 모드 | 조건 | 타이틀 | 버튼 |
|------|------|--------|------|
| 즉시 결제 | `isUpgrade \|\| isBillingCycleChange` | "결제 확인" | "XX,XXX원 결제하기" |
| 크레딧 전환 | `amountDue === 0` | "결제 확인" | "크레딧으로 전환하기" |
| 예약 변경 | `!isUpgrade && !isBillingCycleChange` | "플랜 변경 예약" | "플랜 변경 예약하기" |
| 무료 시작 | `isFree` | "결제 확인" | "무료로 시작하기" |

### OverviewTab 상태 표시

| 상태 | 뱃지 | 안내 |
|------|------|------|
| 활성 | `활성` | - |
| 활성 + 크레딧 | `활성` | 💚 "XX,XXX원의 크레딧이 있습니다. 다음 결제 시 자동 차감됩니다." |
| 취소 예정 (미만료) | `취소 예정` | 🟠 "구독 취소가 예약되었습니다. **날짜**까지 이용 가능" + [구독 유지하기] |
| 취소 예정 + 크레딧 | `취소 예정` | 🟠 위 내용 + ⚠️ "크레딧이 있습니다. 구독 종료 시 소멸됩니다." + [환불 문의하기] |
| 플랜 변경 예약됨 | `활성` | 🔵 "**날짜**부터 **플랜명** 플랜으로 변경됩니다" + [예약 취소] |

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
│ canceledAt === null (취소 예정 X)│
│ endDate === 오늘                │
│ price > 0 (무료 플랜 제외)       │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 크레딧 확인                      │
│ existingCredit = credit ?? 0    │
│ actualAmount = price - credit   │
└─────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
actualAmount  actualAmount
   > 0 ▼        <= 0 ▼
┌────────┐  ┌────────────────────┐
│ 빌링키로 │  │ 결제 스킵          │
│ 결제 요청│  │ 크레딧만으로 갱신   │
└────────┘  └────────────────────┘
         │
    ┌────┴────┐
    │         │
 성공 ▼      실패 ▼
┌────────┐  ┌────────────────────┐
│endDate │  │ retryCount++       │
│+1개월  │  │ 3회 실패 → expired │
│credit  │  └────────────────────┘
│= 남은분│
└────────┘
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

**크레딧 처리 예시:**
```
구독: Pro 월간 49,000원, 크레딧 60,000원
         │
         ▼
┌─────────────────────────────────┐
│ actualAmount = 49,000 - 60,000  │
│             = -11,000 (0 처리)   │
│ remainingCredit = 11,000원       │
└─────────────────────────────────┘
         │
         ▼
결제 없이 갱신, credit = 11,000원 저장
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

### 2. 취소 예정 구독 처리 (`processCanceledSubscriptions`)

```
┌─────────────────────────────────┐
│ status === 'active'             │
│ canceledAt !== null (취소 예정) │
│ endDate <= 오늘                 │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ FREE 플랜으로 다운그레이드       │
│ - planId = 'FREE'               │
│ - price = 0                     │
│ - status = 'expired'            │
│ - canceledAt = null             │
│ - credit = null (크레딧 소멸)   │
└─────────────────────────────────┘
```

**예시: 구독 취소 후 만료**
```
1. 1월 15일: 사용자가 Standard 구독 취소
   - status: 'active' (유지!)
   - canceledAt: 1월 15일 시간
   - endDate: 2월 14일 (기존 유지)
2. 2월 14일까지: Standard 플랜 계속 이용 가능
3. 2월 15일: 스케줄러가 만료 처리
   - planId: 'FREE'
   - status: 'expired'
   - credit: null (소멸)
```

**크레딧 소멸 정책:**
- 취소 예정 상태에서 만료되면 크레딧 소멸
- 만료 전 플랜 변경 시 크레딧 유지
- 환불 요청은 support 이메일로 문의

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

업그레이드/빌링 주기 변경 시 비례 정산:

```typescript
// 예시: Standard 월간(29,000원) → Pro 연간(588,000원), 30일 중 15일 남음
const result = calculateProration({
  currentPlanPrice: 29000,
  currentBillingCycle: 'monthly',
  newPlanPrice: 588000,
  newBillingCycle: 'yearly',
  billingStartDate: new Date('2024-01-01'),
  billingEndDate: new Date('2024-01-31'),
  existingCredit: 0,  // 기존 보유 크레딧
});

// 결과:
// - remainingDays: 15
// - currentPlanCredit: 14,500원 (현재 플랜 미사용 크레딧)
// - existingCredit: 0원 (기존 보유 크레딧)
// - totalCredit: 14,500원
// - newPlanCost: 588,000원 (빌링 주기 변경이므로 전액)
// - amountDue: 573,500원
// - remainingCredit: 0원
// - isUpgrade: true
// - isBillingCycleChange: true
```

---

## 플랜 변경 케이스 요약

### 즉시 적용 케이스 (결제 발생)

| 케이스 | 조건 | 처리 함수 | 결제 금액 |
|--------|------|----------|----------|
| 업그레이드 | `isUpgrade && !isBillingCycleChange` | `upgradePlan()` | 비례 정산 |
| 월간 → 연간 | `isBillingCycleChange` | `upgradePlan()` | 연간 가격 - 남은 크레딧 |
| 연간 → 월간 | `isBillingCycleChange` | `upgradePlan()` | 월간 가격 - 남은 크레딧 (0원 가능) |

### 예약 적용 케이스 (다음 결제일)

| 케이스 | 조건 | 처리 함수 | UI 표시 |
|--------|------|----------|---------|
| 다운그레이드 (같은 주기) | `!isUpgrade && !isBillingCycleChange` | `schedulePlanChange()` | "플랜 변경 예약하기" |
| 무료 전환 | 무료 플랜 선택 | `createFreeSubscription()` | 예약 변경 |

### 구독 취소 케이스

| 케이스 | 조건 | 처리 | 결과 |
|--------|------|------|------|
| 단순 취소 | - | `canceledAt` 설정 | endDate까지 이용, 이후 FREE |
| 크레딧 있는 상태 취소 | `credit > 0` | 소멸 안내 | 환불 문의 경로 제공 |
| 취소 철회 | 같은 플랜 재선택 | `reactivateSubscription()` | `canceledAt` 제거 |
| 취소 후 업그레이드 | 다른 플랜 선택 | `upgradePlan()` | `canceledAt` 제거 + 플랜 변경 |
| 취소 후 다운그레이드 | 더 싼 플랜 선택 | `schedulePlanChange()` | `canceledAt` 제거 + 예약 |

### 크레딧 처리

| 상황 | 처리 |
|------|------|
| 빌링 주기 변경 시 남은 금액 | `credit` 필드에 저장 |
| 다음 결제 시 | 결제 금액에서 크레딧 차감 |
| 구독 취소 만료 시 | 크레딧 소멸 |
| 플랜 변경 시 기존 크레딧 | 새 계산에 합산

### 적용 규칙

| 변경 유형 | 적용 시점 | 결제 |
|----------|---------|------|
| 업그레이드 (저가 → 고가) | 즉시 | 비례 정산 금액 |
| 다운그레이드 (고가 → 저가, 같은 주기) | 다음 결제일 | 없음 (예약) |
| 빌링 주기 변경 (월간 ↔ 연간) | 즉시 | 새 주기 전액 - 크레딧 |
| 무료 → 유료 | 즉시 | 전액 |
| 유료 → 무료 | 다음 결제일 | 없음 |

---

## 주의사항

1. **phoneNumber 필수**: PortOne(KG이니시스)에서 전화번호 필수
2. **Mock 모드**: `NEXT_PUBLIC_IS_MOCK=true`로 테스트 가능
3. **Z-Index**: PortOne 결제창과 Dialog 충돌 → Dialog 먼저 닫고 SDK 호출
4. **스케줄러 배포**: 프론트엔드와 별도로 `packages/scheduler`에서 `wrangler deploy`
