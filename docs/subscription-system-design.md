# 구독 시스템 설계 문서

> 서버 마이그레이션을 위한 설계 레벨 문서

## 목차

1. [시스템 개요](#1-시스템-개요)
2. [데이터 모델](#2-데이터-모델)
3. [구독 상태 머신](#3-구독-상태-머신)
4. [핵심 비즈니스 플로우](#4-핵심-비즈니스-플로우)
5. [스케줄러 작업](#5-스케줄러-작업)
6. [결제 처리](#6-결제-처리)
7. [크레딧 시스템](#7-크레딧-시스템)
8. [에러 처리 및 복구](#8-에러-처리-및-복구)

---

## 1. 시스템 개요

### 1.1 아키텍처

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Client    │────▶│   API Server    │────▶│    Database     │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Payment Gateway │
                        │    (PortOne)     │
                        └─────────────────┘

┌─────────────────┐
│   Scheduler     │──────────────────────────────────────▶
│   (Cron Jobs)   │     정기 결제, 만료 처리, 재시도
└─────────────────┘
```

### 1.2 주요 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| Web Client | 플랜 선택, 결제수단 등록, 구독 관리 UI |
| API Server | 비즈니스 로직, 결제 처리, 데이터 관리 |
| Scheduler | 정기결제 갱신, 만료 처리, 실패 재시도 |
| Payment Gateway | 빌링키 발급, 결제 처리 (PortOne/카카오페이) |

### 1.3 플랜 구조

| 플랜 | 월간 가격 | 연간 가격 (월) | 주요 특징 |
|------|-----------|----------------|-----------|
| FREE | 0원 | - | 최대 30명, 기본 기능 |
| STANDARD | 29,000원 | 24,000원 | 무제한 회원, 물품 관리 |
| PRO | 49,000원 | 35,000원 | 회비/회계 관리, 다중 관리자 |
| ENTERPRISE | 문의 | 문의 | 다중 동아리, 브랜딩 |

> **참고**: PRO는 현재 Coming Soon 상태, ENTERPRISE는 별도 문의

---

## 2. 데이터 모델

### 2.1 Subscription (구독)

```
Subscription {
  id: string (PK)              // 구독 고유 ID
  clubId: number               // 동아리 ID (1:1 관계)
  userId: string               // 생성한 사용자 ID
  userEmail: string            // 사용자 이메일

  // 현재 플랜 정보
  planId: string               // 'FREE' | 'STANDARD' | 'PRO'
  planName: string             // 표시용 이름
  price: number                // 현재 결제 금액
  billingCycle: string         // 'monthly' | 'yearly'

  // 구독 기간
  startDate: timestamp         // 현재 빌링 주기 시작일
  endDate: timestamp | null    // 현재 빌링 주기 종료일 (무료는 null)

  // 상태
  status: string               // 'active' | 'payment_failed' | 'expired' | 'pending'

  // 취소 관련
  canceledAt: timestamp | null // 취소 요청 시점 (null이면 취소 안함)

  // 예약된 플랜 변경 (다음 결제일에 적용)
  nextPlanId: string | null
  nextPlanName: string | null
  nextPlanPrice: number | null

  // 크레딧 (플랜 변경 시 비례 정산)
  credit: number | null        // 보유 크레딧 (원)

  // 결제 관련
  billingKeyId: string         // 연결된 빌링키 ID
  retryCount: number           // 결제 실패 재시도 횟수
  lastPaymentError: string | null

  // 메타데이터
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 2.2 BillingKey (결제수단)

```
BillingKey {
  id: string (PK)              // 빌링키 문서 ID
  clubId: number               // 동아리 ID
  userId: string               // 등록한 사용자 ID
  userEmail: string

  billingKey: string           // PG사 빌링키 (민감정보)
  customerKey: string          // 고객 식별자

  // 카드 정보 (마스킹)
  cardCompany: string          // '신한카드', '카카오페이' 등
  cardNumber: string           // '1234-****-****-5678'

  isDefault: boolean           // 기본 결제수단 여부

  createdAt: timestamp
  updatedAt: timestamp
}
```

**제약 조건:**
- 동아리당 기본 결제수단(`isDefault=true`)은 1개만 존재
- 새 카드 등록 시 기존 기본 카드는 자동으로 `isDefault=false`

### 2.3 Payment (결제 기록)

```
Payment {
  id: string (PK)              // 결제 ID
  subscriptionId: string       // 구독 ID
  clubId: number
  userId: string
  userEmail: string

  // 결제 정보
  orderId: string              // 주문 ID
  transactionId: string        // PG사 거래 ID
  amount: number               // 결제 금액

  // 플랜 정보
  planId: string
  planName: string
  previousPlanId: string | null    // 플랜 변경 시 이전 플랜
  previousPlanName: string | null

  // 상태
  status: string               // 'success' | 'failed'
  type: string                 // 결제 유형 (아래 참조)

  // 크레딧 적용
  creditApplied: number | null // 적용된 크레딧

  // 실패 시
  errorCode: string | null
  errorMessage: string | null

  // 시간
  paidAt: timestamp | null     // 결제 완료 시간
  createdAt: timestamp
}
```

**결제 유형 (type):**

| Type | 설명 |
|------|------|
| `upgrade` | 업그레이드 (즉시 결제) |
| `renewal` | 정기결제 갱신 |
| `plan_change` | 플랜 변경 |
| `billing_cycle_change` | 빌링 주기 변경 |
| `downgrade_to_free` | 무료 플랜으로 다운그레이드 |
| `subscription_canceled` | 구독 취소 완료 |
| `credit_applied` | 크레딧만으로 결제 |

---

## 3. 구독 상태 머신

### 3.1 상태 다이어그램

```
                    ┌─────────┐
                    │ (없음)  │
                    └────┬────┘
                         │ 최초 구독 생성
                         ▼
    ┌────────────────────────────────────────┐
    │                                        │
    │                active                  │◀──────────────┐
    │                                        │               │
    └───────┬──────────────┬────────────────┘               │
            │              │                                 │
   결제 실패│              │ 재시도 3회 실패                │ 재시도 성공
            ▼              │                                 │
    ┌───────────────┐      │                                 │
    │               │      │                                 │
    │ payment_failed│──────┼─────────────────────────────────┘
    │               │      │
    └───────────────┘      │
                           ▼
                   ┌───────────────┐
                   │               │
                   │    expired    │
                   │               │
                   └───────┬───────┘
                           │ 30일 후 정리
                           ▼
                   ┌───────────────┐
                   │  active       │
                   │  (FREE 플랜)  │
                   └───────────────┘
```

### 3.2 상태 설명

| 상태 | 설명 | 다음 상태 |
|------|------|----------|
| `active` | 정상 이용 중 | `payment_failed` (결제 실패 시) |
| `payment_failed` | 결제 실패, 재시도 대기 | `active` (재시도 성공), `expired` (3회 실패) |
| `expired` | 만료됨, 서비스 제한 | `active` (정리 후 FREE로 전환) |
| `pending` | 결제 대기 중 (미사용) | - |

### 3.3 취소 플래그 (`canceledAt`)

- `canceledAt`은 상태가 아닌 **플래그**
- `status=active`이면서 `canceledAt`이 설정된 경우: "취소 예정" 상태
- 사용자는 `endDate`까지 서비스 이용 가능
- `endDate` 도달 시 스케줄러가 처리

---

## 4. 핵심 비즈니스 플로우

### 4.1 신규 구독 (무료 → 유료)

```
1. 사용자가 플랜 선택
2. 결제수단 확인 (없으면 등록 유도)
3. 빌링키로 즉시 결제
4. 성공 시:
   - Subscription 생성/업데이트
   - startDate = 현재
   - endDate = 현재 + 빌링주기
   - Payment 기록 생성
5. 실패 시:
   - 에러 메시지 표시
   - Payment 기록 (status=failed)
```

### 4.2 업그레이드 (STANDARD → PRO)

```
1. 비례 정산 계산:
   - 남은 기간 계산 (일 단위)
   - 크레딧 = (현재 플랜 가격) × (남은 일수 / 전체 일수)
   - 결제 금액 = (새 플랜 가격) - 크레딧

2. 즉시 결제 (결제 금액 > 0인 경우)

3. 성공 시:
   - planId, planName, price 즉시 변경
   - startDate = 현재 (새 빌링 주기 시작)
   - endDate = 현재 + 빌링주기
   - 남은 크레딧 저장 (있으면)
```

### 4.3 다운그레이드 (PRO → STANDARD)

```
1. 즉시 적용하지 않음
2. nextPlanId, nextPlanName, nextPlanPrice 설정
3. 현재 endDate까지 PRO 이용
4. endDate 도달 시 스케줄러가 플랜 변경 적용
```

### 4.4 빌링 주기 변경 (월간 → 연간)

```
1. 비례 정산 계산 (업그레이드와 동일)
2. 즉시 결제
3. 새 빌링 주기로 시작
   - billingCycle = 'yearly'
   - endDate = 현재 + 1년
```

### 4.5 구독 취소

```
1. canceledAt = 현재 시간 설정
2. nextPlanId = null (또는 예약된 다른 플랜)
3. 사용자는 endDate까지 이용 가능
4. "취소 철회" 가능 (canceledAt = null)
5. endDate 도달 시:
   - nextPlanId가 있으면 해당 플랜으로
   - 없으면 FREE로 전환
```

### 4.6 취소 철회 (재구독)

```
1. canceledAt = null
2. 기존 플랜 유지
3. 예약된 플랜 변경 취소 (선택적)
```

---

## 5. 스케줄러 작업

### 5.1 작업 스케줄

| 작업 | 실행 시간 (KST) | 설명 |
|------|-----------------|------|
| 구독 갱신 | 매일 09:00 | 만료된 구독 정기결제 |
| 취소 구독 만료 | 매일 09:00 | 취소된 구독 플랜 전환 |
| 결제 재시도 | 매일 14:00 | 실패한 결제 재시도 |
| 만료 정리 | 매주 월 03:00 | 30일+ 만료 구독 FREE 전환 |

### 5.2 구독 갱신 (processSubscriptionRenewals)

```
조건:
  - status = 'active'
  - endDate <= 현재 시간
  - canceledAt = null (취소 안됨)
  - price > 0 (유료 플랜)

처리:
  1. 기본 빌링키 조회
  2. 예약된 플랜 변경 확인 (nextPlanId)
  3. 크레딧 차감 계산
  4. 결제 진행 (차감 후 금액 > 0인 경우)
  5. 성공:
     - endDate 연장
     - 남은 크레딧 저장
     - 예약된 플랜 적용 (있으면)
  6. 실패:
     - status = 'payment_failed'
     - retryCount 증가
```

### 5.3 취소 구독 만료 (processCanceledSubscriptions)

```
조건:
  - status = 'active'
  - endDate <= 현재 시간
  - canceledAt != null (취소됨)

처리:
  A. nextPlanId가 유료 플랜:
     1. 빌링키 조회
     2. 크레딧 차감 후 결제
     3. 성공: 새 플랜으로 전환, 새 빌링 주기 시작
     4. 실패: FREE로 전환, 크레딧 유지

  B. nextPlanId가 없거나 FREE:
     1. FREE 플랜으로 전환
     2. endDate = null
     3. 크레딧 소멸
```

### 5.4 결제 재시도 (retryFailedPayments)

```
조건:
  - status = 'payment_failed'
  - retryCount < 3

처리:
  1. 갱신 결제 시도
  2. 성공: status = 'active'
  3. 실패:
     - retryCount 증가
     - 3회 도달 시: status = 'expired'
```

### 5.5 만료 정리 (cleanupExpiredSubscriptions)

```
조건:
  - status = 'expired'
  - endDate < 30일 전

처리:
  1. planId = 'FREE'
  2. price = 0
  3. status = 'active'
```

---

## 6. 결제 처리

### 6.1 빌링키 결제 흐름

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Server  │────▶│ PortOne  │────▶│  카드사   │
└──────────┘     └──────────┘     └──────────┘
     │                                  │
     │◀─────────── 결제 결과 ───────────┤
     │
     ▼
 DB 업데이트
```

### 6.2 결제 API 요청

```
POST /payments/{paymentId}/billing-key
Authorization: PortOne {API_SECRET}

{
  "billingKey": "빌링키",
  "orderName": "주문명",
  "amount": {
    "total": 결제금액
  },
  "currency": "KRW"
}
```

### 6.3 결제 실패 처리

| 실패 유형 | 처리 |
|----------|------|
| 카드 잔액 부족 | 재시도 대상 |
| 카드 유효기간 만료 | 재시도 대상, 사용자 알림 |
| 빌링키 무효 | 결제수단 재등록 요청 |
| 일시적 오류 | 재시도 대상 |

---

## 7. 크레딧 시스템

### 7.1 크레딧 발생 조건

- **플랜 업그레이드**: 기존 플랜 남은 기간 비례 정산
- **빌링 주기 변경**: 동일하게 비례 정산

### 7.2 계산 공식

```
남은 일수 = (endDate - 현재) / 하루
전체 일수 = (endDate - startDate) / 하루
남은 비율 = 남은 일수 / 전체 일수

크레딧 = 현재 결제 금액 × 남은 비율

# 특수 케이스: 당일 변경
if 사용 일수 == 0:
    크레딧 = 현재 결제 금액 (100%)
```

### 7.3 크레딧 사용

```
결제 금액 = 새 플랜 가격 - 보유 크레딧
남은 크레딧 = max(0, 보유 크레딧 - 새 플랜 가격)

if 결제 금액 > 0:
    빌링키 결제 진행
else:
    결제 없이 처리 (크레딧으로 충당)
```

### 7.4 크레딧 소멸 조건

- FREE 플랜으로 다운그레이드 시
- 구독 취소 후 FREE로 전환 시

---

## 8. 에러 처리 및 복구

### 8.1 결제 실패 시나리오

| 시나리오 | 처리 |
|----------|------|
| 신규 구독 결제 실패 | 즉시 에러 반환, 재시도 유도 |
| 정기결제 실패 | status='payment_failed', 재시도 예약 |
| 3회 재시도 실패 | status='expired', 서비스 제한 |
| 플랜 변경 결제 실패 | FREE로 전환, 크레딧 유지 |

### 8.2 빌링키 없음

```
결제 시도 시 기본 빌링키 없음:
  - 정기결제: payment_failed 상태로 전환
  - 플랜 변경: FREE로 전환, 에러 메시지 저장
  - 사용자에게 결제수단 등록 요청 (알림)
```

### 8.3 멱등성 보장

- `paymentId`를 유니크하게 생성 (예: `renewal_{clubId}_{timestamp}`)
- 동일 `paymentId`로 중복 결제 방지
- DB 트랜잭션으로 일관성 보장

### 8.4 동시성 처리

```
정기결제 처리 시:
  1. 구독 조회 (for update / 락)
  2. 상태 확인
  3. 결제 처리
  4. 상태 업데이트
  5. 락 해제
```

---

## 부록: API 엔드포인트 (권장)

### 구독 관련

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/subscriptions/{clubId}` | 구독 조회 |
| POST | `/subscriptions` | 신규 구독 |
| PATCH | `/subscriptions/{id}/plan` | 플랜 변경 |
| POST | `/subscriptions/{id}/cancel` | 구독 취소 |
| POST | `/subscriptions/{id}/reactivate` | 취소 철회 |
| POST | `/subscriptions/{id}/retry-payment` | 결제 재시도 |

### 결제수단 관련

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/billing-keys?clubId={id}` | 결제수단 목록 |
| POST | `/billing-keys` | 결제수단 등록 |
| DELETE | `/billing-keys/{id}` | 결제수단 삭제 |
| PATCH | `/billing-keys/{id}/default` | 기본 결제수단 설정 |

### 결제 기록

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/payments?clubId={id}` | 결제 기록 조회 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2024-12 | 최초 작성 |
