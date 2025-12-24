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
         │
         ▼
┌─────────────────┐
│  Scheduler      │
│  (Cloudflare    │
│   Workers)      │
└─────────────────┘
```

---

## 데이터 모델

### Subscription (구독)

```typescript
type SubscriptionStatus =
  | 'active'         // 활성 (정상 이용 중)
  | 'canceled'       // 취소됨 (미사용 - canceledAt 필드로 대체)
  | 'expired'        // 만료됨 (결제 실패 3회 초과)
  | 'pending'        // 대기 중
  | 'payment_failed'; // 결제 실패 (재시도 대기 중)

type BillingCycle = 'monthly' | 'yearly';

type Subscription = {
  id: string;
  clubId: number;
  userId: string;
  userEmail: string;
  planId: string;           // 'FREE' | 'STANDARD' | 'PRO' | 'ENTERPRISE'
  planName: string;
  price: number;            // 실제 결제 금액 (월간이면 월 가격, 연간이면 연 가격)
  billingCycle: BillingCycle; // 결제 주기 (무료 플랜은 null)
  status: SubscriptionStatus;
  startDate: Timestamp;
  endDate: Timestamp | null;  // 다음 결제일 (무료 플랜은 null)
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

  // 결제 실패 시 재시도 정보 (스케줄러에서 설정)
  retryCount?: number;
  lastPaymentError?: string;
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

## 플랜별 특성

| 플랜 | 가격 | endDate | billingCycle | 자동 갱신 |
|------|------|---------|--------------|----------|
| FREE | 0원 | `null` | `null` | 없음 |
| STANDARD | 월 29,000원 / 연 288,000원 | 다음 결제일 | `monthly` / `yearly` | 있음 |
| PRO | 월 49,000원 / 연 588,000원 | 다음 결제일 | `monthly` / `yearly` | 있음 |
| ENTERPRISE | 별도 문의 | 협의 | 협의 | 협의 |

---

## 결제 시나리오 상세

### 1. 신규 유료 구독 (무료 → 유료)

#### 시나리오
사용자가 FREE 플랜에서 STANDARD 또는 PRO 플랜을 선택

#### 처리 흐름
```
1. 결제수단 확인
   ├─ 있음 → ConfirmStep (결제 확인)
   └─ 없음 → SelectCardStep (카드 등록)

2. PortOne 빌링키로 즉시 결제
   POST /api/portone/billing

3. Firebase에 구독 생성
   createSubscriptionWithBillingKey()
   - status: 'active'
   - endDate: 1개월/1년 후
   - billingCycle: 'monthly' / 'yearly'

4. SuccessStep 표시
```

#### Firestore 상태 변화
| 필드 | 변경 전 (FREE) | 변경 후 (STANDARD) |
|------|---------------|-------------------|
| planId | FREE | STANDARD |
| price | 0 | 29000 |
| status | active | active |
| endDate | null | 1개월 후 |
| billingCycle | null | monthly |

#### 테스트 케이스
- [ ] FREE → STANDARD 월간 전환
- [ ] FREE → STANDARD 연간 전환
- [ ] FREE → PRO 월간 전환
- [ ] FREE → PRO 연간 전환
- [ ] 결제수단 없을 때 카드 등록 후 결제

---

### 2. 플랜 업그레이드 (유료 → 더 비싼 유료)

#### 시나리오
STANDARD(29,000원) 플랜 사용자가 PRO(49,000원) 플랜 선택
(결제 주기 30일 중 15일 사용)

#### 처리 흐름
```
1. 비례 정산(Proration) 계산
   calculateProration()
   - remainingDays: 15
   - currentPlanCredit: 14,500원 (29,000 × 15/30)
   - newPlanCost: 24,500원 (49,000 × 15/30)
   - amountDue: 10,000원 (24,500 - 14,500)

2. ConfirmStep에서 비례 정산 표시
   - Pro 플랜 (15일): 24,500원
   - Standard 미사용 크레딧: -14,500원
   - 오늘 결제 금액: 10,000원

3. 즉시 비례 정산 금액 결제 (10,000원)

4. 플랜 즉시 변경
   upgradePlan()
   - planId: 'PRO' (즉시 적용)
   - endDate 유지 (결제 주기 동일)
   - canceledAt 제거 (취소 예정이었다면)
```

#### Firestore 상태 변화
| 필드 | 변경 전 | 변경 후 |
|------|--------|--------|
| planId | STANDARD | PRO |
| planName | Standard | Pro |
| price | 29000 | 49000 |
| endDate | 유지 | 유지 |
| canceledAt | (있었다면) | 삭제됨 |

#### 핵심 규칙
- **즉시 적용**: 업그레이드는 결제 즉시 새 플랜 사용 가능
- **endDate 유지**: 기존 결제 주기 유지
- **취소 철회**: 취소 예정이었던 구독도 재활성화됨

#### 테스트 케이스
- [ ] STANDARD 월간 → PRO 월간 (비례 정산)
- [ ] STANDARD 연간 → PRO 연간 (비례 정산)
- [ ] 취소 예정 상태에서 업그레이드 (canceledAt 제거 확인)

---

### 3. 플랜 다운그레이드 (유료 → 더 싼 유료)

#### 시나리오
PRO(49,000원) 플랜 사용자가 STANDARD(29,000원) 플랜 선택

#### 처리 흐름
```
1. 다운그레이드 감지
   - newPrice < currentPrice
   - proration.isUpgrade === false
   - 같은 빌링 주기

2. 다음 결제일에 플랜 변경 예약
   schedulePlanChange()
   - nextPlanId: 'STANDARD'
   - nextPlanName: 'Standard'
   - nextPlanPrice: 29000
   - canceledAt 제거

3. SuccessStep 표시
   "플랜 변경이 예약되었습니다!"
   "2024년 2월 15일부터 Standard 플랜으로 변경됩니다."
```

#### Firestore 상태 변화
| 필드 | 변경 전 | 예약 후 | 다음 결제일 (스케줄러) |
|------|--------|--------|---------------------|
| planId | PRO | PRO | STANDARD |
| price | 49000 | 49000 | 29000 |
| nextPlanId | - | STANDARD | 삭제됨 |
| nextPlanName | - | Standard | 삭제됨 |
| nextPlanPrice | - | 29000 | 삭제됨 |

#### 핵심 규칙
- **예약 적용**: 다음 결제일까지 현재 플랜 유지
- **이미 결제한 금액**: 현재 기간은 더 비싼 플랜에 대해 이미 결제함
- **스케줄러 처리**: 다음 결제일에 새 플랜 가격으로 결제

#### 스케줄러 처리 (다음 결제일)
```
1. 스케줄러가 endDate 도래한 구독 감지
2. nextPlanId 있으면 해당 플랜 가격(29,000원)으로 결제
3. 결제 성공 시:
   - planId: 'STANDARD'
   - price: 29000
   - nextPlanId/Name/Price: 삭제
   - endDate: 1개월 연장
```

#### 테스트 케이스
- [ ] PRO 월간 → STANDARD 월간 (예약)
- [ ] PRO 연간 → STANDARD 연간 (예약)
- [ ] 예약 후 UI에서 "전환 예정" 표시 확인
- [ ] 예약 취소 기능 테스트
- [ ] 스케줄러가 예약된 플랜으로 결제하는지 확인

---

### 4. 빌링 주기 변경 (월간 ↔ 연간)

#### 4-1. 월간 → 연간 변경 (같은 플랜)

##### 시나리오
Standard 월간(29,000원) 사용자가 Standard 연간(288,000원) 선택
(월간 30일 중 15일 사용)

##### 처리 흐름
```
1. 빌링 주기 변경 감지
   - proration.isBillingCycleChange = true

2. 비례 정산 계산
   - currentPlanCredit: 14,500원 (29,000 × 15/30)
   - newPlanCost: 288,000원 (연간 전액)
   - amountDue: 273,500원 (288,000 - 14,500)

3. 즉시 결제 + 새 빌링 주기 시작
   upgradePlan()
   - billingCycle: 'yearly'
   - startDate: 오늘
   - endDate: 1년 후
```

##### 핵심 규칙
- **즉시 적용**: 빌링 주기 변경은 항상 즉시 적용
- **새 주기 시작**: startDate, endDate 모두 갱신
- **연간 할인**: 연간 결제 시 2개월 할인 (12개월 가격에 10개월 분)

#### 4-2. 연간 → 월간 변경 (크레딧 발생)

##### 시나리오
Standard 연간(288,000원) 사용자가 Pro 월간(49,000원) 선택
(연간 365일 중 90일 사용, 275일 남음)

##### 처리 흐름
```
1. 비례 정산 계산
   - currentPlanCredit: 217,000원 (288,000 × 275/365)
   - newPlanCost: 49,000원 (월간 첫 결제)
   - amountDue: 0원 (크레딧이 더 큼)
   - remainingCredit: 168,000원 (다음 결제에서 차감)

2. ConfirmStep 표시
   - Pro 플랜 (월간): 49,000원
   - 기존 구독 크레딧: -217,000원
   - 오늘 결제 금액: 무료
   - 💰 남은 크레딧 168,000원은 다음 결제에서 자동 차감됩니다

3. 즉시 플랜 변경 + 크레딧 저장
   upgradePlan()
   - billingCycle: 'monthly'
   - credit: 168,000
   - startDate: 오늘
   - endDate: 1개월 후
```

##### Firestore 상태 변화
| 필드 | 변경 전 | 변경 후 |
|------|--------|--------|
| planId | STANDARD | PRO |
| price | 288000 | 49000 |
| billingCycle | yearly | monthly |
| credit | - | 168000 |
| startDate | 갱신됨 | 갱신됨 |
| endDate | 갱신됨 | 1개월 후 |

#### 테스트 케이스
- [ ] 월간 → 연간 변경 (즉시 적용, 비례 정산)
- [ ] 연간 → 월간 변경 (크레딧 발생)
- [ ] 크레딧이 결제 금액보다 클 때 무료 처리
- [ ] 다음 결제에서 크레딧 자동 차감 확인

---

### 5. 크레딧 처리

#### 크레딧 발생 조건
- 연간 → 월간 빌링 주기 변경 시 남은 기간 환불액
- 크레딧이 새 플랜 비용보다 클 때 차액 저장

#### 크레딧 사용
```
구독: Pro 월간 49,000원, 크레딧 168,000원

다음 결제일:
- 결제 필요 금액: 49,000원
- 크레딧 차감: -49,000원
- 실제 결제: 0원
- 남은 크레딧: 119,000원 저장
```

#### 스케줄러 크레딧 처리
```typescript
// packages/scheduler/src/index.ts
const existingCredit = subscription.credit ?? 0;
const actualPaymentAmount = Math.max(0, effectivePrice - existingCredit);
const remainingCredit = Math.max(0, existingCredit - effectivePrice);

if (actualPaymentAmount > 0) {
  // 실제 결제 진행
} else {
  // 크레딧으로 전액 충당 - 결제 없이 갱신
}

// 갱신 후 남은 크레딧 저장
updateData.credit = remainingCredit > 0 ? remainingCredit : null;
```

#### 크레딧 소멸
- **구독 취소 만료 시**: 크레딧 소멸
- **환불 요청**: support 이메일로 문의 필요

#### 테스트 케이스
- [ ] 크레딧 있는 상태에서 자동 결제 (차감 확인)
- [ ] 크레딧이 결제 금액보다 클 때 (결제 없이 갱신)
- [ ] 크레딧 있는 상태에서 구독 취소 (소멸 안내 확인)
- [ ] 크레딧 소멸 시 환불 문의 링크 표시

---

## 구독 취소 시나리오 상세

### 6. 구독 취소 (Soft Cancel)

#### 시나리오
사용자가 유료 플랜에서 "구독 취소" 클릭

#### 처리 흐름
```
1. CancelSubscriptionModal 표시
   "정말 취소하시겠습니까?"

2. cancelSubscription() 호출
   - canceledAt: 현재 시간 (취소 예정)
   - status: 'active' 유지!
   - endDate 유지 (만료일까지 이용)

3. OverviewTab에 안내 표시
   - Badge: "취소 예정"
   - "구독 취소가 예약되었습니다.
     2024년 2월 15일까지 현재 플랜을 이용하실 수 있습니다"
   - [구독 유지하기] 버튼
```

#### Firestore 상태 변화
| 필드 | 취소 전 | 취소 후 | 만료 후 (스케줄러) |
|------|--------|--------|-------------------|
| status | active | active | active |
| planId | PRO | PRO | FREE |
| price | 49000 | 49000 | 0 |
| canceledAt | - | 취소 시점 | 삭제됨 |
| endDate | 다음 결제일 | 유지 | null |
| billingCycle | monthly | 유지 | null |

#### 핵심 규칙
- **status 유지**: `canceledAt` 필드로 취소 상태 구분
- **endDate까지 이용**: 이미 결제한 기간은 정상 이용
- **자동결제 중단**: 스케줄러가 `canceledAt` 있으면 갱신하지 않음

#### 스케줄러 처리 (만료일)
```
1. processCanceledSubscriptions() 실행
2. canceledAt 있고 endDate 지난 구독 감지
3. FREE 플랜으로 다운그레이드:
   - planId: 'FREE'
   - price: 0
   - endDate: null (무료 플랜은 만료일 없음)
   - billingCycle: null
   - canceledAt: 삭제
   - credit: null (크레딧 소멸)
4. 히스토리 기록 생성 (type: 'subscription_canceled')
```

#### 테스트 케이스
- [ ] 구독 취소 후 "취소 예정" 뱃지 표시
- [ ] 취소 후 endDate까지 플랜 기능 이용 가능
- [ ] 취소 예정 상태에서 "구독 유지하기" 클릭 (canceledAt 제거)
- [ ] 만료일에 스케줄러가 FREE로 전환
- [ ] 만료 시 endDate, billingCycle이 null로 변경

---

### 7. 크레딧 있는 상태에서 구독 취소

#### 시나리오
연간 → 월간 변경으로 크레딧 168,000원 보유 중 구독 취소

#### 처리 흐름
```
1. 취소 처리
   cancelSubscription()

2. OverviewTab에 추가 안내 표시
   - ⚠️ 168,000원의 크레딧이 있습니다.
   - 구독 종료 시 크레딧은 소멸됩니다.
   - [환불 문의하기] → 이메일 발송

3. 만료 시 (스케줄러)
   - credit: null (크레딧 소멸)
   - 콘솔에 로그 기록 (추적용)
```

#### 환불 문의 이메일 템플릿
```
mailto:support@woohakdong.com
?subject=크레딧 환불 요청
&body=동아리 ID: {clubId}
      구독 ID: {subscriptionId}
      크레딧 금액: 168,000원

      환불 사유:
```

#### 테스트 케이스
- [ ] 크레딧 있는 상태에서 취소 시 경고 메시지 표시
- [ ] 환불 문의 이메일 링크 동작 확인
- [ ] 만료 시 크레딧 소멸 확인
- [ ] 만료 전 플랜 변경하면 크레딧 유지

---

### 8. 취소 예정 상태에서 다른 플랜 구독

#### 8-1. 같은 플랜 재구독

##### 시나리오
취소 예정인 PRO 플랜에서 다시 PRO 선택

##### 처리 흐름
```
reactivateSubscription()
- canceledAt: 삭제 (취소 철회)
- nextPlanId/Name/Price: 삭제
- 추가 결제 없음 (이미 결제됨)
```

#### 8-2. 업그레이드

##### 시나리오
취소 예정인 STANDARD 플랜에서 PRO 선택

##### 처리 흐름
```
1. 비례 정산 금액 결제
2. upgradePlan()
   - planId: 'PRO' (즉시 적용)
   - canceledAt: 삭제 (취소 철회)
```

#### 8-3. 다운그레이드

##### 시나리오
취소 예정인 PRO 플랜에서 STANDARD 선택

##### 처리 흐름
```
schedulePlanChange()
- nextPlanId: 'STANDARD'
- canceledAt: 삭제 (취소 철회)
- 다음 결제일에 플랜 변경
```

#### 테스트 케이스
- [ ] 취소 예정 상태에서 같은 플랜 클릭 → 구독 유지
- [ ] 취소 예정 상태에서 업그레이드 → 즉시 적용 + 취소 철회
- [ ] 취소 예정 상태에서 다운그레이드 → 예약 + 취소 철회

---

### 9. 예약된 플랜 변경 취소

#### 시나리오
PRO → STANDARD 다운그레이드 예약 후 취소

#### 처리 흐름
```
cancelScheduledPlanChange()
- nextPlanId: 삭제
- nextPlanName: 삭제
- nextPlanPrice: 삭제
→ 현재 PRO 플랜 유지
```

#### 테스트 케이스
- [ ] 예약 변경 상태에서 "예약 취소" 버튼 표시
- [ ] 예약 취소 후 현재 플랜 유지 확인
- [ ] 다음 결제일에 원래 플랜 가격으로 결제

---

### 10. 유료 → 무료 플랜 전환

#### 시나리오
PRO 플랜 사용자가 FREE 플랜 선택

#### 처리 흐름
```
1. 다운그레이드 예약
   schedulePlanChange()
   - nextPlanId: 'FREE'
   - nextPlanPrice: 0

2. 스케줄러 처리 (만료일)
   - 무료 플랜 감지 (nextPlanPrice === 0)
   - 결제 없이 플랜 전환:
     - planId: 'FREE'
     - price: 0
     - endDate: null
     - billingCycle: null
     - credit: null (소멸)
   - 히스토리 기록 (type: 'downgrade_to_free')
```

#### Firestore 상태 변화
| 필드 | 변경 전 | 예약 후 | 만료 후 (스케줄러) |
|------|--------|--------|-------------------|
| planId | PRO | PRO | FREE |
| price | 49000 | 49000 | 0 |
| nextPlanId | - | FREE | null |
| nextPlanPrice | - | 0 | null |
| endDate | 다음 결제일 | 유지 | null |
| billingCycle | monthly | 유지 | null |

#### 테스트 케이스
- [ ] 유료 → 무료 예약 시 UI 표시
- [ ] 만료일에 무료 플랜으로 전환
- [ ] 전환 후 endDate, billingCycle이 null

---

## 결제 실패 시나리오

### 11. 자동 결제 실패

#### 시나리오
결제일에 스케줄러가 자동 결제 시도했으나 잔액 부족 등으로 실패

#### 처리 흐름
```
1. 스케줄러 결제 시도 실패
   - status: 'payment_failed'
   - retryCount: 1
   - lastPaymentError: "잔액이 부족합니다"

2. 웹 UI 알림 표시 (OverviewTab)
   - Badge: "결제 실패"
   - ⚠️ 결제에 실패했습니다. (잔액이 부족합니다)
   - 재시도 횟수: 1/3
   - [결제 재시도] 버튼

3. 스케줄러 자동 재시도 (매일 오후 2시)
   - retryCount < 3이면 재시도
   - 3회 실패 시 status: 'expired'
```

#### Firestore 상태 변화
| 상태 | status | retryCount | lastPaymentError |
|------|--------|------------|------------------|
| 1회 실패 | payment_failed | 1 | "잔액 부족" |
| 2회 실패 | payment_failed | 2 | "잔액 부족" |
| 3회 실패 | expired | 3 | "잔액 부족" |

#### 테스트 케이스
- [ ] 결제 실패 시 "결제 실패" 뱃지 표시
- [ ] 에러 메시지 표시
- [ ] 재시도 횟수 표시
- [ ] 수동 재시도 버튼 동작
- [ ] 3회 실패 시 expired 상태 전환

---

### 12. 수동 결제 재시도

#### 시나리오
결제 실패 상태에서 사용자가 [결제 재시도] 클릭

#### 처리 흐름
```
1. 현재 기본 결제수단으로 결제 시도
   POST /api/portone/billing

2. 성공 시:
   completeRetryPayment()
   - status: 'active'
   - retryCount: 삭제
   - lastPaymentError: 삭제
   - endDate: 1개월/1년 연장

3. 실패 시:
   - 에러 메시지 표시
   - 결제수단 변경 유도
```

#### 테스트 케이스
- [ ] 수동 재시도 성공 → active 상태 복구
- [ ] 수동 재시도 실패 → 에러 메시지 표시
- [ ] 결제수단 변경 후 재시도

---

## 정기결제 스케줄러

> `packages/scheduler` (Cloudflare Workers)

### 스케줄러 역할 분담

| 플랜 변경 유형 | 처리 주체 | 시점 | 함수 |
|--------------|----------|------|-----|
| 신규 구독 | 클라이언트 | 즉시 | `createSubscriptionWithBillingKey` |
| 업그레이드 | 클라이언트 | 즉시 | `upgradePlan` |
| 빌링 주기 변경 | 클라이언트 | 즉시 | `upgradePlan` |
| 다운그레이드 | 스케줄러 | 다음 결제일 | `renewSubscription` |
| 정기 결제 갱신 | 스케줄러 | 매일 09:00 | `renewSubscription` |
| 결제 실패 재시도 | 스케줄러 | 매일 14:00 | `retryFailedPayments` |
| 취소 구독 만료 | 스케줄러 | 매일 09:00 | `processCanceledSubscriptions` |
| 만료 구독 정리 | 스케줄러 | 매주 월요일 03:00 | `cleanupExpiredSubscriptions` |

### Cron 스케줄

| 시간 (KST) | UTC | 작업 |
|-----------|-----|------|
| 매일 09:00 | 00:00 | 구독 갱신 + 취소된 구독 만료 처리 |
| 매일 14:00 | 05:00 | 결제 실패 재시도 |
| 월요일 03:00 | 일요일 18:00 | 만료 구독 정리 (FREE 다운그레이드) |

---

### 스케줄러 처리 상세

#### 구독 갱신 (processSubscriptionRenewals)

```
조건:
- status === 'active'
- canceledAt === null (취소 예정 아님)
- endDate <= 현재 시간
- price > 0 (무료 플랜 제외)

처리:
1. 예약된 플랜 변경 확인 (nextPlanId)
   - 있으면: 새 플랜 가격으로 결제
   - 없으면: 현재 플랜 가격으로 결제

2. 크레딧 확인
   - 크레딧 >= 결제 금액: 결제 없이 갱신
   - 크레딧 < 결제 금액: 차감 후 나머지 결제

3. 기본 결제수단으로 결제 시도

4. 성공 시:
   - endDate: 1개월/1년 연장
   - credit: 남은 크레딧 저장
   - nextPlanId/Name/Price: 삭제 (예약 적용됨)

5. 실패 시:
   - retryCount++
   - status: 'payment_failed' 또는 'expired' (3회 초과)
```

#### 무료 플랜 다운그레이드 (스케줄러)

```
조건:
- nextPlanId 있고 nextPlanPrice === 0

처리:
- 결제 없이 플랜 전환
- endDate: null (무료 플랜은 만료일 없음)
- billingCycle: null
- credit: null (크레딧 소멸)
- 히스토리 기록 (type: 'downgrade_to_free')
```

#### 취소 예정 구독 만료 (processCanceledSubscriptions)

```
조건:
- status === 'active'
- canceledAt !== null (취소 예정)
- endDate <= 현재 시간

처리:
- 결제 없이 FREE 플랜으로 전환
- planId: 'FREE'
- price: 0
- endDate: null
- billingCycle: null
- canceledAt: 삭제
- credit: null (크레딧 소멸)
- 히스토리 기록 (type: 'subscription_canceled')
```

---

## UI 상태 표시

### OverviewTab 상태별 표시

| 상태 | 뱃지 | 안내 | 버튼 |
|------|------|------|------|
| 활성 (정상) | `활성` | - | 구독 취소 |
| 활성 + 크레딧 | `활성` | 💚 "XX,XXX원의 크레딧이 있습니다" | 구독 취소 |
| 결제 실패 | `결제 실패` | 🔴 에러 메시지 + 재시도 횟수 | 결제 재시도 |
| 취소 예정 | `취소 예정` | 🟠 "**날짜**까지 이용 가능" | 구독 유지하기 |
| 취소 예정 + 크레딧 | `취소 예정` | 🟠 위 내용 + ⚠️ "크레딧 소멸 안내" | 구독 유지하기, 환불 문의 |
| 플랜 변경 예약 | `활성` | 🔵 "**날짜**부터 **플랜명** 플랜으로 변경" | 예약 취소 |

### PlansTab 상태별 표시

| 상태 | 현재 플랜 | 다른 플랜 | 비고 |
|------|----------|----------|------|
| 정상 구독 | `현재 플랜` 뱃지 | 변경 버튼 | - |
| 취소 예정 | `현재 플랜` 뱃지 | 변경 버튼 | FREE에 `전환 예정` |
| 플랜 변경 예약 | `현재 플랜` 뱃지 | 예약 플랜에 `전환 예정` | 예약 플랜 버튼 숨김 |

---

## QA 체크리스트

### 신규 구독
- [ ] FREE → STANDARD 월간
- [ ] FREE → STANDARD 연간
- [ ] FREE → PRO 월간
- [ ] FREE → PRO 연간
- [ ] 결제수단 없을 때 등록 플로우

### 플랜 업그레이드
- [ ] STANDARD → PRO (같은 빌링 주기)
- [ ] 비례 정산 금액 정확성
- [ ] 즉시 플랜 변경 확인

### 플랜 다운그레이드
- [ ] PRO → STANDARD 예약
- [ ] 예약 후 UI 표시 ("전환 예정")
- [ ] 예약 취소 기능
- [ ] 스케줄러 처리 (새 플랜 가격으로 결제)

### 빌링 주기 변경
- [ ] 월간 → 연간 (즉시 적용)
- [ ] 연간 → 월간 (크레딧 발생)
- [ ] 크레딧 다음 결제 차감

### 구독 취소
- [ ] 취소 예정 상태 표시
- [ ] endDate까지 이용 가능
- [ ] 구독 유지하기 버튼
- [ ] 만료 시 FREE 전환

### 크레딧
- [ ] 크레딧 표시
- [ ] 자동 결제 시 차감
- [ ] 취소 시 소멸 안내
- [ ] 환불 문의 링크

### 결제 실패
- [ ] 실패 UI 표시
- [ ] 에러 메시지 표시
- [ ] 수동 재시도
- [ ] 3회 실패 시 expired

### 스케줄러
- [ ] 정기 결제 갱신
- [ ] 예약된 플랜 변경 적용
- [ ] 취소 구독 만료 처리
- [ ] 무료 플랜 전환 (endDate = null)
- [ ] 결제 실패 재시도

---

## 테스트 환경 설정

### 빌링 주기 단축 (테스트용)

```bash
# apps/web/.env.local
NEXT_PUBLIC_TEST_BILLING_CYCLE_MINUTES=3  # 3분 빌링 주기

# packages/scheduler/.dev.vars
TEST_BILLING_CYCLE_MINUTES=3  # 스케줄러도 동일하게 설정
```

### 스케줄러 수동 테스트

```bash
# 개발 서버 실행
cd packages/scheduler
pnpm dev --port 8787

# 구독 갱신 테스트
curl http://localhost:8787/test/renewals

# 취소 구독 만료 처리 테스트
curl http://localhost:8787/test/canceled

# 결제 재시도 테스트
curl http://localhost:8787/test/retry
```

---

## 주의사항

1. **phoneNumber 필수**: PortOne(KG이니시스)에서 전화번호 필수
2. **Mock 모드**: `NEXT_PUBLIC_IS_MOCK=true`로 테스트 가능
3. **Z-Index**: PortOne 결제창과 Dialog 충돌 → Dialog 먼저 닫고 SDK 호출
4. **스케줄러 배포**: 프론트엔드와 별도로 `packages/scheduler`에서 `wrangler deploy`
5. **무료 플랜 특수 처리**: endDate, billingCycle이 null
