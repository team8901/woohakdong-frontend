# 우학동 프론트엔드

Turborepo 기반 모노레포 구조의 우학동 프론트엔드 코드베이스입니다. Next.js(App Router)와 Shadcn UI, Tailwind CSS를 중심으로 일관된 디자인 시스템과 개발자 경험(DX)을 제공합니다.

<br>

## ✨ 주요 기능

- 서버 컴포넌트 우선(App Router) 아키텍처 적용으로 성능과 DX 최적화
- 공용 UI 패키지(packages/ui) 기반의 일관된 디자인 시스템(Shadcn/ui + Tailwind CSS 4)
- next-themes를 통한 다크/라이트 테마 토글 및 퍼시스턴스
- React Query(packages/react-query) 기반 데이터 캐싱/동기화 패턴 제공
- MSW(Mock Service Worker)로 API 목킹(dev:mock) 지원, 백엔드 무관한 기능 개발 가능
- Storybook을 통한 컴포넌트 개발/문서화/시각 테스트(workbench)
- Jest + React Testing Library 기반 단위 테스트 환경
- Turborepo 캐시/파이프라인으로 빠른 빌드와 병렬화된 워크플로우
- Axios API 클라이언트(packages/api), Firebase 초기화(packages/firebase) 스켈레톤 제공
- Husky + lint-staged 프리커밋 훅으로 일관된 코드 품질 보장

<br>

## 🚀 기술 스택

| 카테고리           | 기술                                          | 버전                  |
| ------------------ | --------------------------------------------- | --------------------- |
| **프레임워크**     | Next.js                                       | 15.4.5                |
| **런타임**         | React                                         | 19.1.1                |
| **언어**           | TypeScript                                    | 5.9.2                 |
| **모노레포**       | Turborepo                                     | 2.5.5                 |
| **패키지 매니저**  | pnpm                                          | 10.14.0               |
| **UI 라이브러리**  | Shadcn/ui, Radix UI                           | -                     |
| **스타일링**       | Tailwind CSS                                  | 4.1.11                |
| **아이콘**         | Lucide React                                  | 0.536.0               |
| **테마**           | next-themes                                   | 0.4.6                 |
| **폼**             | React Hook Form                               | 7.62.0                |
| **폼 검증**        | @hookform/resolvers, Zod                      | 5.2.1, 4.0.15         |
| **데이터 패칭**    | TanStack React Query, React Query Devtools    | 5.84.2, 5.84.2        |
| **API 클라이언트** | Axios                                         | 1.11.0                |
| **상태 관리**      | Zustand                                       | 5.0.7                 |
| **백엔드 목킹**    | MSW                                           | 2.10.5                |
| **문서화**         | Storybook                                     | 9.1.2                 |
| **린팅/포맷팅**    | ESLint, Prettier, prettier-plugin-tailwindcss | 9.32.0, 3.6.2, 0.6.14 |
| **Git 훅**         | Husky, lint-staged                            | 9.1.7, 16.1.5         |

<br>

## 📁 프로젝트 구조

```
woohakdong-frontend/
├── apps/
│   └── web/                 # 메인 웹 애플리케이션 (Next.js 15)
│       ├── app/             # App Router
│       ├── components/      # 웹 전용 컴포넌트
│       ├── hooks/           # 웹 전용 훅
│       └── lib/             # 웹 전용 유틸리티
├── packages/
│   ├── ui/                  # 공용 UI 컴포넌트 (Shadcn/ui 기반)
│   ├── api/                 # API 클라이언트 유틸
│   ├── react-query/         # React Query 헬퍼
│   ├── store/               # 전역 상태 관리
│   ├── firebase/            # Firebase 초기화/설정
│   ├── eslint-config/       # 공유 ESLint 설정
│   └── typescript-config/   # 공유 TS 설정
├── turbo.json               # Turborepo 설정
└── pnpm-workspace.yaml      # pnpm 워크스페이스 설정
```

<br>

## ✅ 필수 요구사항

- Node.js 20 이상
- pnpm 10.14.0 이상

<br>

## 🛠️ 설치

```bash
# 1) 의존성 설치
pnpm install

# 2) 개발 서버 실행 (모든 앱)
pnpm dev

# 웹 앱만 개발 서버 실행
pnpm dev --filter=web

# Mock API 모드로 실행 (모든 앱)
pnpm dev:mock
# 웹 앱만 Mock 모드 실행
pnpm --filter=web dev:mock

# 3) 프로덕션 빌드
pnpm build          # 전체
pnpm build --filter=web

# 4) 프로덕션 실행 (웹)
pnpm --filter=web start

# 품질 도구
pnpm lint           # 린트
pnpm lint:fix       # 린트 자동수정
pnpm format         # prettier 포맷팅
pnpm test           # 테스트(모노레포)
pnpm --filter=web test
pnpm --filter=web typecheck
```

<br>

## 🧑‍💻 규칙

1. 브랜치 전략

- 네이밍: `태그/설명` (예: `feat/user-auth-signup-login`, `fix/web-header-layout-mobile`)
- 태그: feat, fix, docs, chore, design, refactor, cicd

2. 커밋 컨벤션

- 형식: `Tag: 요약` (예: `Feat: Add user auth`)
- Tag: Init, Feat, Fix, Docs, Chore, Design, Refactor, CI/CD
- 가능한 작은 단위로 커밋하고, 변경 요약/의도/범위를 명확히 기술합니다.

3. 코드 스타일/품질

- 공용 ESLint/Prettier 설정 사용(`@workspace/eslint-config`, prettier + tailwindcss 플러그인)
- 프리커밋 훅: 스테이지된 파일에 대해 자동 린트/수정(lint-staged) 후 커밋 차단/안내가 동작합니다.

4. PR 가이드

- 단위가 큰 변경은 기능별로 쪼개어 제출합니다.
- 설명 템플릿(.github/pull_request_template.md)에 맞춰 배경/변경점/테스트/체크리스트를 채웁니다.
- 스크린샷/동영상/스토리북 링크 등 시각 자료를 적극 활용합니다.
