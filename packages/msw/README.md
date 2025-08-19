## 📦 MSW(Mock Service Worker) 사용 가이드

이 프로젝트는 클라이언트/서버에서 공통적으로 사용할 수 있는 MSW 기반 Mock API 환경을 제공합니다.
로컬 개발 시 서버 API 없이도 프론트엔드 작업이 가능하며, 테스트 및 UI 개발을 병렬로 진행할 수 있습니다.

### ✅ 사용 목적

- BE API 미완성 상태에서도 프론트엔드 개발 진행
- 안정적인 UI 테스트를 위한 API 응답 제어
- E2E 테스트 및 QA 자동화 시 mock 활용

## 📁 폴더 구조

```
apps/web/src/mock/
├── handlers/
│   └── club/
│       └── getClubInfoSearch/
│           ├── mockData.ts               // ① 실제 응답 형식의 mock 데이터 정의
│           └── mockGetClubInfoSearch.ts  // ② Mock API 정의
├── handlers/index.ts                     // ③ 전체 mock handler 등록

```

## 🧩 파일별 역할

### 1. mockData.ts - 순수 목 데이터 정의

```javascript
export const 동아리_정보_없음: ClubInfoSearchResponse = {
  data: [],
};

export const 동아리_정보_있음: ClubInfoSearchResponse = {
  data: [
    {
      id: 0,
      name: '두잇',
      nameEn: 'doit',
      description: '아주대학교 프로그래밍 동아리입니다',
      thumbnailImageUrl: '',
      bannerImageUrl: '',
      roomInfo: '구학 234호',
      groupChatLink: '',
      dues: 10000,
    },
  ],
};
```

- API 응답 형식(ClubInfoSearchResponse)에 맞춰 실제 목 데이터를 정의합니다.
- 하나의 mock API에 여러 상태(mock case)를 정의할 수 있습니다.

### 2. mockGetClubInfoSearch.ts - mock API 정의

```javascript
export const mockGetClubInfoSearch = {
  url: API_URL.CLUB.CLUB_INFO_SEARCH,
  description: '동아리 정보 검색',
  method: 'get',
  response: {
    동아리_정보_없음: {
      status: 200,
      delayTime: 2000,
      data: 동아리_정보_없음,
    },
    동아리_정보_있음: {
      status: 200,
      delayTime: 2000,
      data: 동아리_정보_있음,
    },
    에러: {
      status: 400,
      delayTime: 2000,
      data: {
        errorCode: 400,
        errorMessage: '에러 메시지',
      },
    },
  },
} satisfies MockApiResponse<
  '동아리_정보_없음' | '동아리_정보_있음' | '에러',
  ClubInfoSearchResponse
>;
```

- 실제 API의 `url`, `method`와 정확히 일치해야 MSW가 요청을 가로챌 수 있습니다.
- 다양한 응답 시나리오를 response 필드에 나눠 정의합니다.
- `delayTime`으로 네트워크 지연 효과도 테스트할 수 있습니다.

### 3. handlers/index.ts - 전체 핸들러 등록

```javascript
const handlers = [createMockHandler(mockGetClubInfoSearch, '동아리_정보_있음')];
```

- 앞서 정의한 mock API 중 어떤 응답 시나리오를 활성화할지 선택해 등록합니다.
- `createMockHandler(mock, key)`를 통해 특정 mock 응답을 선택적으로 핸들러로 등록합니다.

## 🚀 MSW 적용 방법

```javascript
// 브라우저 (layout.tsx 안에서)
<EnableMockClient />;

// 서버 (instrumentation.ts 안에서)
const { mockServerListen } = await import('./mock/server');

mockServerListen();
```
