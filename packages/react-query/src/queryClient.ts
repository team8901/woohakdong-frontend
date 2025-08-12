import {
  MutationObserverOptions,
  QueryClient,
  QueryObserverOptions,
  UseMutationOptions,
  UseQueryOptions,
  UseSuspenseQueryOptions,
} from '@tanstack/react-query';

type Options = {
  queryOptions?: Omit<QueryObserverOptions, 'queryKey'>;
  mutationOptions?: MutationObserverOptions<unknown, unknown, unknown, unknown>;
};

/** default 캐싱 시간 (5분) */
const DEFAULT_QUERY_CACHE_TIME = 1000 * 60 * 5;

/**
 * React Query 기본 쿼리 옵션
 *
 * - 실패시 재시도하지 않음 (retry: false)
 * - 캐시된 데이터를 가비지 컬렉션하기 전까지 5분간 유지 (gcTime: 5분)
 * - 데이터를 즉시 신선하지 않은 상태로 간주 (staleTime: 0)
 * - 윈도우 포커스시 재요청 하지 않음 (refetchOnWindowFocus: false)
 * - 쿼리 실행 중 오류 발생 시 예외를 던짐 (throwOnError: true)
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults - 공식문서
 * @see https://github.com/TanStack/query/blob/main/packages/query-core/src/types.ts - 구현부
 */
const DEFAULT_QUERY_OPTIONS: Options['queryOptions'] = {
  /**
   * 실패시 재시도 하지 않음
   */
  retry: false,

  /**
   * 캐시된 데이터를 가비지 컬렉션하기 전까지 5분간 유지
   */
  gcTime: DEFAULT_QUERY_CACHE_TIME,

  /**
   * 데이터를 즉시 신선하지 않은 상태로 간주
   * - 쿼리 실행 시 매번 최신 데이터를 불러오도록 하기 위함
   */
  staleTime: 0,

  /**
   * 윈도우 포커스시 재요청 하지 않음
   */
  refetchOnWindowFocus: false,

  /**
   * 쿼리 실행 중 오류 발생 시 예외를 던짐
   */
  throwOnError: true,
};

/**
 * React Query 기본 뮤테이션 옵션
 *
 * - 쿼리 실행 중 오류 발생 시 예외를 던짐 (throwOnError: true)
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults - 공식문서
 * @see https://github.com/TanStack/query/blob/main/packages/query-core/src/types.ts - 구현부
 */
const DEFAULT_MUTATION_OPTIONS: Options['mutationOptions'] = {
  /**
   * 뮤테이션 실행 중 오류 발생 시 예외를 던짐
   */
  throwOnError: true,
};

/**
 * QueryClient 생성 함수
 *
 * @param queryOptions - 사용자 정의 쿼리 옵션 (queryKey 제외)
 * @param mutationOptions - 사용자 정의 뮤테이션 옵션
 * @returns QueryClient 인스턴스
 *
 * @see https://tanstack.com/query/latest/docs/reference/QueryClient
 */
export const getQueryClient = ({ queryOptions, mutationOptions }: Options) =>
  new QueryClient({
    defaultOptions: {
      queries: {
        ...DEFAULT_QUERY_OPTIONS,
        ...queryOptions,
      },
      mutations: {
        ...DEFAULT_MUTATION_OPTIONS,
        ...mutationOptions,
      },
    },
  });

/** queryKey 와 queryFn 이 생략된 UseQueryOptions 타입 */
export type OmittedQueryOptions<TData = unknown> = Omit<
  UseQueryOptions<TData>,
  'queryKey' | 'queryFn'
>;

/** queryKey 와 queryFn 이 생략된 UseSuspenseQueryOptions 타입 */
export type OmittedSuspenseQueryOptions<TData = unknown> = Omit<
  UseSuspenseQueryOptions<TData>,
  'queryKey' | 'queryFn'
>;

/** mutationFn 이 생략된 UseMutationOptions 타입 */
export type OmittedMutationOptions<TData = unknown> = Omit<
  UseMutationOptions<TData>,
  'mutationFn'
>;
