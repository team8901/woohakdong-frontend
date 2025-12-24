# 정기결제 스케줄러 플랫폼 비교

정기결제 자동 갱신을 위한 스케줄러 플랫폼을 선정하면서 고려한 옵션들을 비교합니다.

## 요구사항

- 매일 정해진 시간에 구독 갱신 결제 실행
- 결제 실패 시 재시도 로직
- 만료된 구독 정리
- Firebase Firestore 접근 필요
- PortOne API 호출 필요

---

## 플랫폼 비교

| 항목 | Cloudflare Workers | GitHub Actions | Firebase Functions |
|------|-------------------|----------------|-------------------|
| **무료 티어** | 100,000 req/일 | 2,000분/월 | 125,000 invocations/월 |
| **Cron 지원** | ✅ 네이티브 (Cron Triggers) | ✅ 네이티브 (schedule) | ✅ 네이티브 (pubsub.schedule) |
| **최소 실행 간격** | 1분 | 5분 | 1분 |
| **Cold Start** | ~0ms (V8 isolates) | 10-30초 (VM 부팅) | 1-3초 (Node.js) |
| **실행 시간 제한** | 30초 (무료), 15분 (유료) | 6시간 | 9분 (Gen1), 60분 (Gen2) |
| **Firebase SDK** | ✅ 가능 (Admin SDK) | ✅ 가능 | ✅ 네이티브 |
| **Secrets 관리** | ✅ wrangler secret | ✅ Repository secrets | ✅ Secret Manager |
| **모니터링** | ✅ Workers Analytics | ⚠️ 제한적 (Actions 로그) | ✅ Cloud Logging |
| **로컬 개발** | ✅ wrangler dev | ⚠️ act (비공식) | ✅ emulator |
| **배포 복잡도** | 낮음 | 매우 낮음 | 중간 |

---

## 각 플랫폼 장단점

### Cloudflare Workers ✅ (선택)

**장점**
- Cold start가 거의 없음 (V8 isolates 사용)
- 무료 티어가 넉넉함 (100,000 req/일)
- 글로벌 엣지 배포로 빠른 응답
- `wrangler` CLI로 간편한 배포/관리
- Cron Triggers로 정확한 스케줄링

**단점**
- Firebase Admin SDK 초기화 방식이 다름 (서비스 계정 JSON 필요)
- Node.js API 일부 미지원 (Workers 런타임 제약)
- 디버깅이 다소 불편할 수 있음

**적합한 경우**
- 짧은 실행 시간의 주기적 작업
- Cold start가 중요한 경우
- 비용 효율성이 중요한 경우

---

### GitHub Actions

**장점**
- 별도 인프라 설정 불필요
- Repository 내에서 코드와 스케줄러 함께 관리
- 다양한 Actions 마켓플레이스 활용 가능
- 가장 간단한 설정

**단점**
- Cold start가 김 (VM 부팅 10-30초)
- 최소 실행 간격 5분 (정밀한 스케줄링 어려움)
- 무료 티어 제한 (2,000분/월)
- 실행 시간이 비용에 직접 영향

**적합한 경우**
- 간단한 CI/CD 연계 작업
- 실행 빈도가 낮은 작업
- 빠른 프로토타이핑

---

### Firebase Functions

**장점**
- Firebase 프로젝트와 네이티브 통합
- Firestore 트리거 사용 가능
- 익숙한 Node.js 환경
- Cloud Logging으로 상세한 모니터링

**단점**
- Cold start 있음 (1-3초)
- Blaze 플랜 필요 (유료, 종량제)
- 이미 Firebase Hosting 사용 중이라 Functions 추가 시 복잡도 증가
- Gen1/Gen2 마이그레이션 고려 필요

**적합한 경우**
- Firebase 생태계에 올인한 프로젝트
- Firestore 트리거 기반 이벤트 처리
- 이미 Blaze 플랜 사용 중인 경우

---

## 최종 선택: Cloudflare Workers

**선택 이유**

1. **Cold Start 없음**: 결제 처리는 빠른 응답이 중요하므로 V8 isolates의 즉시 시작이 유리
2. **넉넉한 무료 티어**: 일일 100,000 요청으로 현재 규모에 충분
3. **간편한 Cron 설정**: `wrangler.toml`에서 선언적으로 관리
4. **독립적인 인프라**: 기존 Firebase/Vercel 인프라와 분리되어 장애 격리 가능
5. **빠른 배포**: `pnpm wrangler deploy` 한 줄로 배포 완료

**구현 위치**
```
packages/scheduler/
├── src/
│   └── index.ts          # Worker 진입점
├── wrangler.toml         # Cron 및 환경 설정
└── package.json
```

**Cron 스케줄**
```toml
[triggers]
crons = [
  "0 0 * * *",     # 매일 00:00 UTC (09:00 KST) - 구독 갱신
  "0 5 * * *",     # 매일 05:00 UTC (14:00 KST) - 결제 재시도
  "0 18 * * SUN"   # 매주 일요일 18:00 UTC (월요일 03:00 KST) - 만료 정리
]
```

---

## 참고 자료

- [Cloudflare Workers Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [GitHub Actions scheduled events](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Firebase Scheduled Functions](https://firebase.google.com/docs/functions/schedule-functions)
