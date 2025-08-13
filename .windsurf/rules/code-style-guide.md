---
trigger: glob
globs: *.ts, *.tsx, *.js
---

# Code Style & Development Guidelines

## Core Principles

### 1. Readability First

Write code that tells a story. Every function, variable, and component should clearly communicate its purpose.

#### Naming Conventions

```typescript
// ✅ Good - Descriptive and clear
const ANIMATION_DELAY_MS = 300;
const DEBOUNCE_DELAY_MS = 500;
const isUserAuthenticated = user && user.token;
const hasValidEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);

// ❌ Bad - Magic numbers and unclear names
const delay = 300;
const d = 500;
const check = user && user.token;
```

#### Component Structure

```typescript
// ✅ Good - Clear separation of concerns
function UserProfile({ userId }: { userId: string }) {
  const { user, isLoading, error } = useUser(userId);

  if (isLoading) return <UserProfileSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <UserNotFound />;

  return <UserProfileContent user={user} />;
}

// ❌ Bad - Complex nested ternaries
function UserProfile({ userId }: { userId: string }) {
  const { user, isLoading, error } = useUser(userId);

  return isLoading ? <UserProfileSkeleton /> : error ? <ErrorMessage error={error} /> : !user ? <UserNotFound /> : <UserProfileContent user={user} />;
}
```

### 2. Predictability

Code should behave exactly as its name and signature suggest.

#### Consistent Return Types

```typescript
// ✅ Good - Consistent query hook pattern
function useUser(userId: string): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
}

function useClubs(): UseQueryResult<Club[], Error> {
  return useQuery({
    queryKey: ['clubs'],
    queryFn: fetchClubs,
  });
}
```

#### Single Responsibility

```typescript
// ✅ Good - Function only fetches data
async function fetchUserBalance(userId: string): Promise<number> {
  const response = await fetch(`/api/users/${userId}/balance`);
  return response.json();
}

// Caller handles logging explicitly
async function handleBalanceUpdate(userId: string) {
  const balance = await fetchUserBalance(userId);
  console.log('Balance fetched:', balance);
  await updateUI(balance);
}
```

### 3. Cohesion

Keep related code together and ensure modules have a single, well-defined purpose.

#### Feature-Based Organization

```typescript
// domains/club/
├── components/
│   ├── ClubCard.tsx
│   ├── ClubList.tsx
│   └── ClubForm.tsx
├── hooks/
│   ├── useClubs.ts
│   ├── useClubMembers.ts
│   └── useClubJoin.ts
├── types/
│   └── club.types.ts
└── utils/
    └── club.utils.ts
```

### 4. Low Coupling

Minimize dependencies between different parts of the codebase.

#### Composition Over Props Drilling

```typescript
// ✅ Good - Direct composition
function ClubManagementModal({ club, onClose }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage {club.name}</DialogTitle>
        </DialogHeader>

        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search members..."
        />

        <MemberList
          clubId={club.id}
          searchTerm={searchTerm}
        />
      </DialogContent>
    </Dialog>
  );
}
```

## TypeScript Guidelines

### Strict Type Definitions

```typescript
// ✅ Good - Strict and readonly where appropriate
export type Club = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly memberCount: number;
  readonly createdAt: Date;
  readonly isActive: boolean;
};

export type ClubUpdate = Partial<Pick<Club, 'name' | 'description'>>;
export type ClubMember = {
  readonly userId: string;
  readonly clubId: string;
  readonly role: 'admin' | 'member';
  readonly joinedAt: Date;
};
```

### Generic Utilities

```typescript
// ✅ Good - Reusable API hook factory
export function createApiHook<TData, TError = Error>(
  queryKey: (string | number)[],
  queryFn: () => Promise<TData>,
) {
  return function useApiData(): UseQueryResult<TData, TError> {
    return useQuery({ queryKey, queryFn });
  };
}

// Usage
export const useClubDetails = (clubId: string) =>
  createApiHook(['club', clubId], () => fetchClub(clubId));
```

## React & Next.js Patterns

### Server Components First

```typescript
// ✅ Good - Server component for data fetching
// app/clubs/page.tsx
export default async function ClubsPage() {
  const clubs = await fetchClubs();

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">동아리 목록</h1>
      <ClubGrid clubs={clubs} />
    </div>
  );
}

// ✅ Good - Client component only when needed
// components/ClubGrid.tsx
'use client';

export function ClubGrid({ clubs }: { clubs: Club[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <SearchInput value={searchTerm} onChange={setSearchTerm} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClubs.map(club => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>
    </div>
  );
}
```

### Error Boundaries & Loading States

```typescript
// ✅ Good - Proper error handling
export function ClubDetailsPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<ClubDetailsSkeleton />}>
      <ErrorBoundary fallback={<ClubDetailsError />}>
        <ClubDetailsContent clubId={params.id} />
      </ErrorBoundary>
    </Suspense>
  );
}
```

## Styling Guidelines

### Tailwind CSS Best Practices

```typescript
// ✅ Good - Semantic class grouping and responsive design
export function ClubCard({ club }: { club: Club }) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-2 text-lg font-semibold">
            {club.name}
          </CardTitle>
          <Badge variant={club.isActive ? 'default' : 'secondary'}>
            {club.isActive ? '활성' : '비활성'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {club.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>멤버 {club.memberCount}명</span>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Button className="w-full" size="sm">
          자세히 보기
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Custom Utility Classes

```css
/* packages/ui/src/styles/globals.css */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

## State Management

### Scoped State Hooks

```typescript
// ✅ Good - Focused, single-purpose hooks
export function useClubSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ClubFilters>({});

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: clubs, isLoading } = useQuery({
    queryKey: ['clubs', 'search', debouncedSearchTerm, filters],
    queryFn: () => searchClubs(debouncedSearchTerm, filters),
  });

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    clubs,
    isLoading,
  };
}
```

### URL State Management

```typescript
// ✅ Good - Specific query param hook
export function useClubIdParam() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const clubId = searchParams.get('clubId');

  const setClubId = useCallback(
    (newClubId: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (newClubId) {
        params.set('clubId', newClubId);
      } else {
        params.delete('clubId');
      }
      router.replace(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  return [clubId, setClubId] as const;
}
```

## Performance Optimization

### Dynamic Imports

```typescript
// ✅ Good - Code splitting for heavy components
const ClubAnalytics = dynamic(() => import('./ClubAnalytics'), {
  loading: () => <AnalyticsSkeleton />,
  ssr: false,
});

const ClubMemberChart = dynamic(
  () => import('./ClubMemberChart').then(mod => ({ default: mod.ClubMemberChart })),
  { loading: () => <ChartSkeleton /> }
);
```

### Memoization

```typescript
// ✅ Good - Strategic memoization
export const ClubList = memo(function ClubList({ clubs }: { clubs: Club[] }) {
  const sortedClubs = useMemo(
    () => clubs.sort((a, b) => b.memberCount - a.memberCount),
    [clubs]
  );

  return (
    <div className="space-y-4">
      {sortedClubs.map(club => (
        <ClubCard key={club.id} club={club} />
      ))}
    </div>
  );
});
```

## Error Handling

### Custom Error Types

```typescript
// ✅ Good - Specific error types
export class ClubNotFoundError extends Error {
  constructor(clubId: string) {
    super(`Club with ID ${clubId} not found`);
    this.name = 'ClubNotFoundError';
  }
}

export class ClubJoinError extends Error {
  constructor(reason: string) {
    super(`Failed to join club: ${reason}`);
    this.name = 'ClubJoinError';
  }
}
```

### Error Boundaries

```typescript
// ✅ Good - Specific error boundary
export function ClubErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <Card className="p-6 text-center">
          <CardHeader>
            <CardTitle className="text-destructive">동아리 정보 오류</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              동아리 정보를 불러오는 중 오류가 발생했습니다.
            </p>
            <Button onClick={resetError} variant="outline">
              다시 시도
            </Button>
          </CardContent>
        </Card>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

## File Organization

### Import Order

```typescript
// ✅ Good - Organized imports
// 1. React and Next.js
import React from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Internal packages
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';

// 4. Relative imports
import { useClubs } from '../hooks/useClubs';
import { ClubCard } from './ClubCard';

// 5. Types (last)
import type { Club } from '../types/club.types';
```

### File Naming

```
// ✅ Good - Consistent naming
components/
├── ClubCard.tsx          # PascalCase for components
├── club-form.tsx         # kebab-case acceptable
└── index.ts              # barrel exports

hooks/
├── useClubs.ts           # camelCase with 'use' prefix
└── useClubMembers.ts

utils/
├── formatDate.ts         # camelCase for utilities
└── validateEmail.ts

types/
├── club.types.ts         # descriptive with .types suffix
└── api.types.ts
```

This code style guide ensures consistency, maintainability, and optimal performance across the WooHakDong frontend codebase.
