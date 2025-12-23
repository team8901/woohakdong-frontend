# 정기결제 스케줄러

Cloudflare Workers 기반 정기결제 자동화 스케줄러입니다.

## 개요

| 스케줄         | 시간 (KST)           | 기능                                                     |
| -------------- | -------------------- | -------------------------------------------------------- |
| 구독 갱신      | 매일 오전 9시        | 만료 예정 구독의 정기결제 처리 + 다운그레이드 적용       |
| 취소 구독 만료 | 매일 오전 9시        | 취소된 구독의 만료 처리 (FREE 또는 예약된 플랜으로 전환) |
| 결제 재시도    | 매일 오후 2시        | 실패한 결제 재시도 (최대 3회)                            |
| 만료 정리      | 매주 월요일 오전 3시 | 30일 이상 만료된 구독을 무료 플랜으로 다운그레이드       |

## 환경 설정

### 1. 필수 시크릿

Cloudflare Workers에서 사용할 시크릿을 등록해야 합니다.

```bash
cd packages/scheduler

# 포트원 API 시크릿
pnpm wrangler secret put PORTONE_API_SECRET

# Firebase 프로젝트 ID
pnpm wrangler secret put FIREBASE_PROJECT_ID

# Firebase 서비스 계정 키 (JSON 문자열)
pnpm wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY
```

> **참고**: `FIREBASE_SERVICE_ACCOUNT_KEY`는 Firebase 콘솔 > 프로젝트 설정 > 서비스 계정 > 새 비공개 키 생성에서 다운로드한 JSON 파일의 내용입니다.

### 2. 로컬 개발 환경

로컬 테스트를 위해 `.dev.vars` 파일을 생성합니다.

```bash
# packages/scheduler/.dev.vars
PORTONE_API_SECRET=your_portone_api_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"..."}
ENVIRONMENT=development
```

> **주의**: `.dev.vars` 파일은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.

## 실행 방법

### 로컬 개발 서버

```bash
cd packages/scheduler

# 개발 서버 실행 (포트 고정)
pnpm dev --port 8787

# 또는 모노레포 루트에서
pnpm --filter @workspace/scheduler dev -- --port 8787
```

서버가 실행되면 터미널에 출력된 URL에서 접근 가능합니다.

> **참고**: `--port` 옵션을 생략하면 사용 가능한 랜덤 포트가 할당됩니다.

### 프로덕션 배포

Cloudflare Workers에 배포됩니다.

```bash
cd packages/scheduler

# 1. Cloudflare 로그인 (최초 1회, 브라우저에서 인증)
pnpm wrangler login

# 2. 시크릿 등록 (최초 1회)
pnpm wrangler secret put PORTONE_API_SECRET
pnpm wrangler secret put FIREBASE_PROJECT_ID
pnpm wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY

# 3. 배포
pnpm wrangler deploy
```

배포 완료 시 URL이 출력됩니다:

```
https://woohakdong-scheduler.<subdomain>.workers.dev
```

> **참고**: Cloudflare 계정이 없다면 [dash.cloudflare.com](https://dash.cloudflare.com)에서 무료로 생성할 수 있습니다. Workers 무료 플랜은 일 10만 요청까지 지원합니다.

## 테스트 방법

### HTTP 엔드포인트

로컬 개발 서버 실행 후 다음 엔드포인트로 테스트할 수 있습니다.

| 엔드포인트           | 설명                         | 환경 제한     |
| -------------------- | ---------------------------- | ------------- |
| `GET /health`        | 헬스 체크                    | 없음          |
| `GET /test/renewals` | 구독 갱신 테스트             | development만 |
| `GET /test/canceled` | 취소된 구독 만료 처리 테스트 | development만 |
| `GET /test/retry`    | 결제 재시도 테스트           | development만 |
| `GET /test/cleanup`  | 만료 정리 테스트             | development만 |

```bash
# 개발 서버 실행 후 터미널에 출력된 포트 확인
# 예: [wrangler:inf] Ready on http://localhost:8787

# 헬스 체크
curl http://localhost:8787/health

# 구독 갱신 테스트 (ENVIRONMENT=development 필요)
curl http://localhost:8787/test/renewals

# 취소된 구독 만료 처리 테스트
curl http://localhost:8787/test/canceled

# 결제 재시도 테스트
curl http://localhost:8787/test/retry

# 만료 정리 테스트
curl http://localhost:8787/test/cleanup
```

> **참고**: `/test/*` 엔드포인트는 `ENVIRONMENT`가 `production`이 아닐 때만 동작합니다. 포트 번호는 터미널 출력을 확인하세요.

### 보안 (선택)

API 키 인증을 추가하려면:

```bash
# API 키 시크릿 등록
pnpm wrangler secret put SCHEDULER_API_KEY

# 요청 시 Bearer 토큰 포함
curl -H "Authorization: Bearer YOUR_API_KEY" \
     http://localhost:8787/test/renewals
```

### Cron 트리거 테스트

#### 수동 트리거 (권장)

```bash
cd packages/scheduler

# 개발 서버 실행
pnpm wrangler dev --test-scheduled --port 8787

# 다른 터미널에서 수동 트리거
curl "http://localhost:8787/__scheduled?cron=0+0+*+*+*"
```

#### 개발용 설정으로 배포 테스트

개발용 설정 파일(`wrangler.dev.toml`)은 1분 간격 Cron으로 설정되어 있어, 배포 후 빠르게 테스트할 수 있습니다.

```bash
cd packages/scheduler

# 개발용 설정으로 배포 (Cloudflare에서 1분마다 실행)
pnpm wrangler deploy --config wrangler.dev.toml
```

> **주의**: 로컬에서는 Cron이 자동 실행되지 않습니다. 배포 후 Cloudflare에서만 자동 실행됩니다.
>
> **주의**: 개발용 배포는 실제 결제가 발생할 수 있으므로 테스트 데이터로만 사용하세요.

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Workers                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Cron Triggers                           │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────────────┐  │   │
│  │  │ 0 0 * * * │ │ 0 5 * * * │ │ 0 18 * * 0        │  │   │
│  │  │ (갱신)    │ │ (재시도)  │ │ (정리)            │  │   │
│  │  └─────┬─────┘ └─────┬─────┘ └─────────┬─────────┘  │   │
│  └────────┼─────────────┼─────────────────┼────────────┘   │
│           │             │                 │                 │
│           ▼             ▼                 ▼                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Scheduler                          │   │
│  └───────────────────────┬─────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼                               ▼
   ┌───────────────┐               ┌───────────────┐
   │  Firebase     │               │   PortOne     │
   │  Firestore    │               │   API         │
   │  (REST API)   │               │               │
   └───────────────┘               └───────────────┘
```

## 처리 흐름

### 구독 갱신 (processSubscriptionRenewals)

1. 오늘 만료되는 `active` 상태 구독 조회
2. 무료 플랜(`price === 0`)은 스킵
3. 등록된 빌링키로 포트원 결제 API 호출
4. 성공 시: 구독 기간 1개월 연장, 결제 기록 생성
5. 실패 시: `payment_failed` 상태로 변경, 재시도 카운트 증가

### 결제 재시도 (retryFailedPayments)

1. `payment_failed` 상태이고 `retryCount < 3`인 구독 조회
2. 다시 결제 시도
3. 성공 시: `active` 상태로 복원
4. 실패 시: 재시도 카운트 증가, 3회 초과 시 `expired` 상태로 변경

### 취소된 구독 만료 처리 (processCanceledSubscriptions)

1. `canceled` 상태이고 `endDate <= 오늘`인 구독 조회
2. `nextPlanId`가 있으면 해당 플랜으로 변경
3. 없으면 `FREE` 플랜으로 다운그레이드
4. `status`를 `active`로 변경

### 만료 정리 (cleanupExpiredSubscriptions)

1. `expired` 상태이고 30일 이상 지난 구독 조회
2. 무료 플랜(`FREE`)으로 자동 다운그레이드

## 트러블슈팅

### 시크릿 확인

```bash
cd packages/scheduler

# 등록된 시크릿 목록 확인
pnpm wrangler secret list
```

### 로그 확인

```bash
cd packages/scheduler

# 실시간 로그 스트리밍 (프로덕션)
pnpm wrangler tail
```

### 일반적인 오류

| 오류                           | 원인                  | 해결                                  |
| ------------------------------ | --------------------- | ------------------------------------- |
| `Billing key not found`        | 삭제된 빌링키         | 사용자에게 결제수단 재등록 요청       |
| `Firebase access token failed` | 잘못된 서비스 계정 키 | `FIREBASE_SERVICE_ACCOUNT_KEY` 재설정 |
| `PortOne API error`            | 잘못된 API 시크릿     | `PORTONE_API_SECRET` 재설정           |
