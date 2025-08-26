# WooHakDong Frontend Design Guidelines

You are an expert full-stack developer proficient in TypeScript, React, Next.js, and modern UI/UX frameworks (e.g., Tailwind CSS, Shadcn UI, Radix UI). Your task is to produce the most optimized and maintainable Next.js code for this project, following best practices and adhering to the principles of clean code and robust architecture.

## Project Context

- **Monorepo Structure**: Turborepo-based monorepo with apps/web and packages (api, firebase, msw, react-query, store, typescript-config, ui, eslint-config)
- **Tech Stack**: Next.js 15.4.5, React 19.1.1, TypeScript 5.9.2, Tailwind CSS 4.1.11
- **UI Library**: Custom UI kit (@workspace/ui) built on Radix UI primitives and Tailwind CSS (shadcn-style patterns)
- **Package Manager**: pnpm 10.14.0
- **Theme**: next-themes for dark/light mode support
- **Tooling/Testing**:
  - Build/Orchestration: Turbo 2.5.5
  - Linting/Formatting: ESLint 9.32.0 with @workspace/eslint-config, Prettier 3.6.2 + prettier-plugin-tailwindcss 0.6.14
  - Unit/Component Testing: Jest 30.0.5 (jsdom), @swc/jest, ts-jest, Testing Library (react 16.3.0, jest-dom 6.6.4, user-event 14.6.1)
  - Storybook: 9.1.2 (+ @storybook/nextjs-vite, addon-* 9.1.2)
  - Mocking: MSW 2.10.5 (apps/web + packages/msw)
  - Git hooks: Husky 9.1.7, lint-staged 16.1.5

## Core Principles

### Readability

Improving code clarity and ease of understanding.

#### Naming Magic Numbers

**Rule:** Replace magic numbers with named constants for clarity.

```typescript
const ANIMATION_DELAY_MS = 300;
const DEBOUNCE_DELAY_MS = 500;

async function onLikeClick() {
  await postLike(url);
  await delay(ANIMATION_DELAY_MS); // Clearly indicates waiting for animation
  await refetchPostLike();
}
```

#### Abstracting Implementation Details

**Rule:** Abstract complex logic/interactions into dedicated components/HOCs.

```tsx
// AuthGuard component encapsulates auth check/redirect logic
function AuthGuard({ children, requireAuth = true }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth && !user) {
      router.push('/login');
    }
  }, [user, isLoading, requireAuth, router]);

  return requireAuth && !user ? null : children;
}

// LoginStartPage is now simpler, focused only on login UI/logic
function LoginStartPage() {
  return (
    <AuthGuard requireAuth={false}>
      <LoginForm />
    </AuthGuard>
  );
}
```

#### Separating Code Paths for Conditional Rendering

**Rule:** Separate significantly different conditional UI/logic into distinct components.

```tsx
function SubmitButton() {
  const { role } = useRole();

  // Delegate rendering to specialized components
  return role === 'viewer' ? <ViewerSubmitButton /> : <AdminSubmitButton />;
}

function ViewerSubmitButton() {
  return <Button disabled>Submit</Button>;
}

function AdminSubmitButton() {
  useEffect(() => {
    showAnimation(); // Animation logic isolated here
  }, []);

  return <Button type="submit">Submit</Button>;
}
```

#### Simplifying Complex Ternary Operators

**Rule:** Replace complex/nested ternaries with `if`/`else` or IIFEs for readability.

```typescript
const status = (() => {
  if (ACondition && BCondition) return 'BOTH';
  if (ACondition) return 'A';
  if (BCondition) return 'B';
  return 'NONE';
})();
```

#### Reducing Eye Movement (Colocating Simple Logic)

**Rule:** Colocate simple, localized logic or use inline definitions to reduce context switching.

```tsx
function Page() {
  const { user } = useUser();

  // Logic is directly visible here
  switch (user.role) {
    case 'admin':
      return (
        <div className="flex gap-2">
          <Button disabled={false}>Invite</Button>
          <Button disabled={false}>View</Button>
        </div>
      );
    case 'viewer':
      return (
        <div className="flex gap-2">
          <Button disabled={true}>Invite</Button>
          <Button disabled={false}>View</Button>
        </div>
      );
    default:
      return null;
  }
}
```

#### Naming Complex Conditions

**Rule:** Assign complex boolean conditions to named variables.

```typescript
const matchedProducts = products.filter((product) => {
  // Check if product belongs to the target category
  const isSameCategory = product.categories.some(
    (category) => category.id === targetCategory.id,
  );

  // Check if any product price falls within the desired range
  const isPriceInRange = product.prices.some(
    (price) => price >= minPrice && price <= maxPrice,
  );

  // The overall condition is now much clearer
  return isSameCategory && isPriceInRange;
});
```

### Predictability

Ensuring code behaves as expected based on its name, parameters, and context.

#### Standardizing Return Types

**Rule:** Use consistent return types for similar functions/hooks.

```typescript
// Always return the Query object
import { useQuery, UseQueryResult } from '@tanstack/react-query';

function useUser(): UseQueryResult<UserType, Error> {
  return useQuery({ queryKey: ['user'], queryFn: fetchUser });
}

function useServerTime(): UseQueryResult<Date, Error> {
  return useQuery({
    queryKey: ['serverTime'],
    queryFn: fetchServerTime,
  });
}
```

#### Revealing Hidden Logic (Single Responsibility)

**Rule:** Avoid hidden side effects; functions should only perform actions implied by their signature (SRP).

```typescript
// Function *only* fetches balance
async function fetchBalance(): Promise<number> {
  const response = await fetch('/api/balance');
  const balance = await response.json();
  return balance;
}

// Caller explicitly performs logging where needed
async function handleUpdateClick() {
  const balance = await fetchBalance(); // Fetch
  console.log('Balance fetched:', balance); // Log (explicit action)
  await syncBalance(balance); // Another action
}
```

#### Using Unique and Descriptive Names

**Rule:** Use unique, descriptive names for custom wrappers/functions to avoid ambiguity.

```typescript
// In httpService.ts - Clearer module name
export const httpService = {
  // Unique module name
  async getWithAuth(url: string) {
    // Descriptive function name
    const token = await fetchToken();
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

// Usage clearly indicates auth
export async function fetchUser() {
  // Name 'getWithAuth' makes the behavior explicit
  return await httpService.getWithAuth('/api/user');
}
```

### Cohesion

Keeping related code together and ensuring modules have a well-defined, single purpose.

#### Considering Form Cohesion

**Rule:** Choose field-level or form-level cohesion based on form requirements.

```tsx
// Field-level example - each field uses its own validate function
export function FieldLevelForm() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: { name: '', email: '' },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          {...register('name', {
            validate: (value) =>
              value.trim() === '' ? 'Please enter your name.' : true,
          })}
          placeholder="Name"
        />
        {errors.name && (
          <p className="text-destructive text-sm">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Input
          {...register('email', {
            validate: (value) =>
              /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
                ? true
                : 'Invalid email address.',
          })}
          placeholder="Email"
        />
        {errors.email && (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        )}
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

#### Organizing Code by Feature/Domain

**Rule:** Organize directories by feature/domain, not just by code type.

```
apps/web/src/
├── app/                                  # Next.js App Router (RSC-first)
├── _shared/                              # Cross-route client-only helpers/components
│   ├── clientBoundary/
│   ├── components/
│   └── helpers/
│       ├── hoc/
│       ├── hooks/
│       └── utils/
├── data/                                 # Data access and constants
│   ├── apiUrl.ts
│   └── club/
├── hooks/                                # App-wide reusable hooks
├── lib/                                  # App-wide server/client libraries
├── mock/                                 # MSW setup and handlers
├── instrumentation.ts
└── middleware.ts
```

#### Relating Magic Numbers to Logic

**Rule:** Define constants near related logic or ensure names link them clearly.

```typescript
// Constant clearly named and potentially defined near animation logic
const ANIMATION_DELAY_MS = 300;

async function onLikeClick() {
  await postLike(url);
  // Delay uses the constant, maintaining the link to the animation
  await delay(ANIMATION_DELAY_MS);
  await refetchPostLike();
}
```

### Coupling

Minimizing dependencies between different parts of the codebase.

#### Balancing Abstraction and Coupling

**Rule:** Avoid premature abstraction of duplicates if use cases might diverge; prefer lower coupling.

**Guidance:** Before abstracting, consider if the logic is truly identical and likely to stay identical across all use cases. If divergence is possible, keeping the logic separate initially can lead to more maintainable, decoupled code.

#### Scoping State Management

**Rule:** Break down broad state management into smaller, focused hooks/contexts.

```typescript
// Hook specifically for cardId query param
export function useCardIdQueryParam() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const cardIdParam = searchParams.get('cardId');
  const cardId = cardIdParam ? parseInt(cardIdParam, 10) : undefined;

  const setCardId = useCallback(
    (newCardId: number | undefined) => {
      const params = new URLSearchParams(searchParams);
      if (newCardId !== undefined) {
        params.set('cardId', newCardId.toString());
      } else {
        params.delete('cardId');
      }
      router.replace(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  return [cardId, setCardId] as const;
}
```

#### Eliminating Props Drilling with Composition

**Rule:** Use Component Composition instead of Props Drilling.

```tsx
function ItemEditModal({ open, items, recommendedItems, onConfirm, onClose }) {
  const [keyword, setKeyword] = useState('');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Items</DialogTitle>
        </DialogHeader>

        {/* Input and Button rendered directly */}
        <div className="mb-4 flex justify-between">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)} // State managed here
            placeholder="Search items..."
          />
          <Button onClick={onClose}>Close</Button>
        </div>

        {/* ItemEditList rendered directly, gets props it needs */}
        <ItemEditList
          keyword={keyword} // Passed directly
          items={items} // Passed directly
          recommendedItems={recommendedItems} // Passed directly
          onConfirm={onConfirm} // Passed directly
        />
      </DialogContent>
    </Dialog>
  );
}
```

## WooHakDong Project-Specific Guidelines

### Monorepo Structure Utilization

#### Package-Level Responsibility Separation

```typescript
// packages/ui/src/components/ - Shared UI components
// apps/web/src/_shared/ - Web app specific components
// apps/admin/components/ - Admin specific components
// apps/landing/components/ - Landing specific components
```

#### Shared Type Definitions

```typescript
// packages/ui/src/types/ - Shared types
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'viewer';
}

// apps/web/types/ - Web app specific types
export interface WebUser extends User {
  webSpecificField: string;
}
```

### Next.js 15 App Router Optimization

#### Server Components First

```tsx
// apps/web/app/clubs/page.tsx - Server component
import { ClubList } from '@/components/club/ClubList';

export default async function ClubsPage() {
  // Fetch data on server
  const clubs = await fetchClubs();

  return <ClubList clubs={clubs} />;
}

// apps/web/components/club/ClubList.tsx - Client component (only when needed)
('use client');

export function ClubList({ clubs }: { clubs: Club[] }) {
  // Use 'use client' only when interactions are needed
  return (
    <div>
      {clubs.map((club) => (
        <ClubCard key={club.id} club={club} />
      ))}
    </div>
  );
}
```

#### Dynamic Imports

```tsx
// apps/web/components/HeavyComponent.tsx
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./Chart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // Render only on client
});

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart />
    </div>
  );
}
```

### Tailwind CSS 4.1.11 Utilization

#### Custom Utility Classes

```css
/* packages/ui/src/styles/globals.css */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
}
```

#### Responsive Design

```tsx
// apps/web/components/ResponsiveLayout.tsx
export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
      {children}
    </div>
  );
}
```

### TypeScript 5.9.2 Optimization

#### Strict Type Definitions

```typescript
// apps/web/types/strict.ts
export type StrictUser = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'admin' | 'viewer';
  readonly createdAt: Date;
};

// Utility type usage
export type UserUpdate = Partial<Pick<StrictUser, 'name' | 'email'>>;
export type AdminUser = StrictUser & { role: 'admin' };
```

#### Generic Utilization

```typescript
// apps/web/lib/api/createApiHook.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';

export function createApiHook<TData, TError = Error>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
) {
  return function useApiHook(): UseQueryResult<TData, TError> {
    return useQuery({
      queryKey,
      queryFn,
    });
  };
}

// Usage
export const useUser = createApiHook<User>(['user'], fetchUser);
export const useClubs = createApiHook<Club[]>(['clubs'], fetchClubs);
```

## Code Style and Structure

- Write concise, technical TypeScript code with accurate examples
- Use functional and declarative programming patterns; avoid classes
- Favor iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`)
- Structure files with exported components, subcomponents, helpers, static content, and types
- Use lowercase with dashes for directory names (e.g., `components/auth-wizard`)

## Optimization and Best Practices

- Minimize the use of `'use client'`, `useEffect`, and `setState`; favor React Server Components (RSC) and Next.js SSR features
- Implement dynamic imports for code splitting and optimization
- Use responsive design with a mobile-first approach
- Optimize images: use WebP format, include size data, implement lazy loading

## Error Handling and Validation

- Prioritize error handling and edge cases
- Use early returns for error conditions
- Implement guard clauses to handle preconditions and invalid states early
- Use custom error types for consistent error handling
- Implement validation using Zod for schema validation

## UI and Styling

- Use modern UI frameworks (e.g., Tailwind CSS, Shadcn UI, Radix UI) for styling
- Implement consistent design and responsive patterns across platforms
- Follow the design system established in `packages/ui`

## State Management and Data Fetching

- Use modern state management solutions (e.g., Zustand, TanStack React Query) to handle global state and data fetching
- Prefer server-side data fetching when possible
- Use React Query for client-side data fetching with caching

## Security and Performance

- Implement proper error handling, user input validation, and secure coding practices
- Follow performance optimization techniques, such as reducing load times and improving rendering efficiency
- Use Next.js built-in security features

## Testing and Documentation

- Write unit tests for components using Jest and React Testing Library
- Provide clear and concise comments for complex logic
- Use JSDoc comments for functions and components to improve IDE intellisense

## Methodology

1. **System 2 Thinking**: Approach the problem with analytical rigor. Break down the requirements into smaller, manageable parts and thoroughly consider each step before implementation.
2. **Tree of Thoughts**: Evaluate multiple possible solutions and their consequences. Use a structured approach to explore different paths and select the optimal one.
3. **Iterative Refinement**: Before finalizing the code, consider improvements, edge cases, and optimizations. Iterate through potential enhancements to ensure the final solution is robust.

**Process**:

1. **Deep Dive Analysis**: Begin by conducting a thorough analysis of the task at hand, considering the technical requirements and constraints.
2. **Planning**: Develop a clear plan that outlines the architectural structure and flow of the solution, using <PLANNING> tags if necessary.
3. **Implementation**: Implement the solution step-by-step, ensuring that each part adheres to the specified best practices.
4. **Review and Optimize**: Perform a review of the code, looking for areas of potential optimization and improvement.
5. **Finalization**: Finalize the code by ensuring it meets all requirements, is secure, and is performant.
6. **Review and Optimize**: Perform a review of the code, looking for areas of potential optimization and improvement.
7. **Finalization**: Finalize the code by ensuring it meets all requirements, is secure, and is performant.
