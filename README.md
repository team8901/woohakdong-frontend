# 우학동 프론트엔드

우학동 프론트엔드 개발을 위한 Turborepo 기반 모노레포입니다.

<br>

## 🚀 기술 스택

| 카테고리          | 기술             | 버전    |
| ----------------- | ---------------- | ------- |
| **프레임워크**    | Next.js          | 15.4.5  |
| **런타임**        | React            | 19.1.1  |
| **언어**          | TypeScript       | 5.9.2   |
| **모노레포**      | Turborepo        | 2.5.5   |
| **패키지 매니저** | pnpm             | 10.4.1  |
| **UI 라이브러리** | Shadcn/ui        | -       |
| **스타일링**      | Tailwind CSS     | 4.1.11  |
| **아이콘**        | Lucide React     | 0.536.0 |
| **테마**          | next-themes      | 0.4.6   |
| **폼 검증**       | Zod              | 4.0.15  |
| **개발 도구**     | ESLint, Prettier | -       |

<br>

## 📁 프로젝트 구조

```
woohakdong-frontend/
├── apps/
│   ├── web/                # 메인 웹 애플리케이션 (Next.js 15)
│   │   ├── app/            # App Router 구조
│   │   ├── components/     # 웹앱 전용 컴포넌트
│   │   ├── hooks/          # 웹앱 전용 훅
│   │   └── lib/            # 웹앱 전용 유틸리티
│   ├── landing/            # 랜딩 페이지 (준비 중)
│   └── admin/              # 관리자 페이지 (준비 중)
├── packages/
│   ├── ui/                 # 공유 UI 컴포넌트 라이브러리
│   │   ├── src/
│   │   │   ├── components/ # Shadcn/ui 기반 컴포넌트
│   │   │   ├── fonts/      # 폰트
│   │   │   ├── hooks/      # 공유 React 훅
│   │   │   ├── lib/        # 유틸리티 함수
│   │   │   └── styles/     # 글로벌 Tailwind CSS 스타일
│   │   └── components.json # Shadcn/ui 설정
│   ├── eslint-config/      # 공유 ESLint 설정
│   └── typescript-config/  # 공유 TypeScript 설정
├── turbo.json              # Turborepo 설정
└── pnpm-workspace.yaml     # pnpm 워크스페이스 설정
```

<br>

## 🚀 시작하기

### **필수 요구사항**

- Node.js 20 이상
- pnpm 10.4.1 이상

### **설치 및 실행**

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (모든 앱)
pnpm dev

# 웹 앱만 개발 서버 실행
pnpm dev --filter=web

# 프로덕션 빌드 (모든 앱)
pnpm build

# 웹 앱만 빌드
pnpm build --filter=web

# 린팅 (모든 패키지)
pnpm lint

# 코드 포맷팅
pnpm format

# 타입 체크 (웹 앱)
pnpm --filter=web typecheck
```

<br>

## 📦 패키지 구조

### **apps/web**

메인 웹 애플리케이션입니다.

**주요 기술:**

- Next.js 15.4.5 (App Router)
- React 19.1.1
- TypeScript 5.9.2
- Turbopack (개발 서버)

**주요 의존성:**

- `@workspace/ui`: 공유 UI 컴포넌트 라이브러리
- `lucide-react`: 아이콘
- `next-themes`: 다크/라이트 테마

### **packages/ui** (`@workspace/ui`)

모든 앱에서 사용하는 공유 UI 컴포넌트 라이브러리입니다.

**주요 기능:**

- Shadcn/ui 기반 컴포넌트들
- Tailwind CSS 4.1.11 스타일링
- Pretendard 폰트 포함
- 다크/라이트 테마 지원

**주요 의존성:**

- `@radix-ui/react-slot`: Radix UI 슬롯
- `class-variance-authority`: CVA 유틸리티
- `clsx`, `tailwind-merge`: CSS 클래스 유틸리티
- `tw-animate-css`: Tailwind 애니메이션
- `zod`: 스키마 검증

**내보내기:**

- `./globals.css`: 글로벌 스타일
- `./components/*`: UI 컴포넌트들
- `./lib/*`: 유틸리티 함수들
- `./hooks/*`: React 훅들

### **packages/eslint-config**

모든 패키지에서 사용하는 공유 ESLint 설정입니다.

**포함 설정:**

- `base.js`: 기본 ESLint 규칙
- `next.js`: Next.js 전용 규칙
- `react-internal.js`: React 내부 규칙

### **packages/typescript-config**

모든 패키지에서 사용하는 공유 TypeScript 설정입니다.

**포함 설정:**

- `base.json`: 기본 TypeScript 설정
- `nextjs.json`: Next.js 전용 설정
- `react-library.json`: React 라이브러리 설정

<br>

## 🚀 개발 가이드

### **새 컴포넌트 추가**

UI 컴포넌트는 `packages/ui/src/components/`에 추가하고, 앱별 컴포넌트는 각 앱의 `components/` 폴더에 추가합니다.

### **Shadcn/ui 컴포넌트 추가**

```bash
# UI 패키지로 이동
cd packages/ui

# 새 컴포넌트 추가 (예: button)
npx shadcn-ui@latest add button
```

<br>

## 🔧 협업 룰

### 브랜치

| **구분**     | **규칙**                                                                                                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Name**     | • `태그/브랜치 제목`의 규칙으로 작성<br>• 이슈를 해결하기 위한 브랜치를 만드는 것을 기본으로 함                                                                                                                                            |
| **Tag type** | • `feat` : 새로운 기능 추가<br>• `chore` : 사소한 코드 수정<br>• `fix` : 에러 및 버그 수정<br>• `docs` : 문서 수정<br>• `design` : 디자인 관련 코드 추가 및 수정<br>• `refactor` : 코드 리팩토링<br>• `cicd` : 배포 관련 설정 추가 및 수정 |

```
# 예시)

feat/user-auth-signup-login

fix/web-header-layout-mobile
```

### 커밋

| **구분**     | **규칙**                                                                                                                                                                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**     | • `태그: 커밋 제목`의 규칙으로 작성<br>• 작은 단위로 커밋을 작성하는 것을 기본으로 함                                                                                                                                                                                   |
| **Tag type** | • `Init` : 프로젝트 생성<br>• `Feat` : 새로운 기능 추가<br>• `Chore` : 사소한 코드 수정<br>• `Fix` : 에러 및 버그 수정<br>• `Docs` : 문서 수정<br>• `Design` : 디자인 관련 코드 추가 및 수정<br>• `Refactor` : 코드 리팩토링<br>• `CI/CD` : 배포 관련 설정 추가 및 수정 |

```
# 예시)

Feat: Add user auth
- 사용자 인증(회원가입/로그인) 기능 추가
- ...

Fix: Modify header layout in mobile
- 모바일에서 헤더 레이아웃 깨짐 수정
- ...
```
