# @workspace/api

Woohakdong API 클라이언트 패키지

## 자동 생성된 API 클라이언트

이 패키지는 OpenAPI 스펙에서 자동으로 생성된 TypeScript API 클라이언트를 포함합니다.

### API 타입 생성

```bash
# 루트 디렉토리에서 실행
pnpm generate:api
```

이 명령은:

1. `https://api.woohakdong.com/v3/api-docs`에서 OpenAPI 스펙을 가져옴
2. `packages/api/src/generated` 디렉토리에 TypeScript 타입과 API 함수를 생성
3. ESM import 경로에 `.js` 확장자를 자동으로 추가 (TypeScript NodeNext 모듈 해석 요구사항)
4. 생성된 파일에 `/* eslint-disable */` 자동 추가

### 사용 방법

#### 1. 기본 사용법

```typescript
import { getJoinedClubs, searchClubs } from '@workspace/api/generated';

// 내가 가입한 동아리 조회
const clubs = await getJoinedClubs();

// 동아리 검색
const searchResult = await searchClubs({
  nameEn: 'doit',
  nameKo: '두잇',
  page: 0,
  size: 10,
});
```

#### 2. 타입 사용

```typescript
import type {
  ClubRegisterRequest,
  ClubIdResponse,
  ListWrapperClubInfoResponse,
} from '@workspace/api/generated';

const registerData: ClubRegisterRequest = {
  nameKo: '두잇',
  nameEn: 'doit',
  // ...
};

const response: ClubIdResponse = await registerNewClub(registerData);
```

#### 3. 에러 핸들링

```typescript
import { isAxiosError } from '@workspace/api';
import type { AxiosError } from '@workspace/api';

try {
  const clubs = await getJoinedClubs();
} catch (error) {
  if (isAxiosError(error)) {
    console.error('API Error:', error.response?.status);
  }
}
```

### 인증

모든 API 호출은 자동으로 인증 토큰을 포함합니다. `packages/api/src/interceptors.ts`에서 설정된 인터셉터가 자동으로 처리합니다.

### 생성된 API 목록

- **Auth**: `socialLogin`, `refreshToken`, `test`
- **Club**: `updateClubInfo`, `getJoinedClubs`, `registerNewClub`, `searchClubs`, `validateClubName`, 등
- **Club Membership**: `getClubMember`, `getClubMembers`
- **Notice**: `getNotice`, `updateNotice`, `deleteNotice`, `getClubNotices`, `createClubNotice`
- **User Profile**: `createUserProfile`, `getUserProfileMe`
- **Util**: `getImagePresignedUrl`

### 기존 코드 마이그레이션

기존에 수동으로 작성한 API 호출 코드를 생성된 코드로 대체할 수 있습니다:

**Before:**

```typescript
// apps/web/src/data/club/getClubMembers/fetch.ts
export const getClubMembers = async ({ clubId }: GetClubMembersRequest) => {
  const response = await api.get<GetClubMembersResponse>(
    `/api/clubs/${clubId}/members`,
  );
  return response.data;
};
```

**After:**

```typescript
import { getClubMembers } from '@workspace/api/generated';

// 함수를 직접 사용
const members = await getClubMembers(clubId);
```

### 설정

Orval 설정은 `orval.config.ts`에서 관리됩니다:

- **OpenAPI Spec URL**: `https://api.woohakdong.com/v3/api-docs`
- **출력 디렉토리**: `packages/api/src/generated`
- **클라이언트 타입**: `axios-functions`
- **커스텀 인스턴스**: `packages/api/src/axios.ts`의 `customInstance`

### 주의사항

- `packages/api/src/generated` 디렉토리의 파일들은 자동 생성되므로 직접 수정하지 마세요.
- API 스펙이 변경되면 `pnpm generate:api`를 다시 실행하세요.
- 생성된 코드는 Git에 커밋됩니다.
