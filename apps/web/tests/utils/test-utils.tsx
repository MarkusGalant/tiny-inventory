import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

/**
 * Wraps a component with React Router's MemoryRouter for testing.
 * @param children - The component to wrap
 * @param initialEntries - Initial route entries (default: ['/'])
 * @returns A component wrapped with MemoryRouter
 */
export function withRouter(
  children: React.ReactNode,
  initialEntries: string[] = ['/'],
): React.ReactElement {
  return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;
}

/**
 * Creates a mock query result for testing React Query hooks.
 * @param options - Options to configure the mock query result
 * @returns A mock UseQueryResult object
 */
export function createMockQueryResult<TData = unknown>(
  options: {
    data?: TData;
    isLoading?: boolean;
    isError?: boolean;
    error?: Error | null;
    isSuccess?: boolean;
    isFetching?: boolean;
    isRefetching?: boolean;
    status?: 'pending' | 'error' | 'success';
    errorUpdateCount?: number;
    refetch?: () => Promise<UseQueryResult<TData>>;
  } = {},
): UseQueryResult<TData> {
  const {
    data,
    isLoading = false,
    isError = false,
    error = null,
    isSuccess = data !== undefined && !isError && !isLoading,
    isFetching = isLoading,
    isRefetching = false,
    status = isLoading ? 'pending' : isError ? 'error' : 'success',
    errorUpdateCount = 0,
    refetch = vi.fn().mockResolvedValue({} as UseQueryResult<TData>),
  } = options;

  return {
    data,
    dataUpdatedAt: Date.now(),
    error,
    errorUpdateCount,
    failureCount: isError ? 1 : 0,
    failureReason: error,
    fetchStatus: isFetching ? 'fetching' : 'idle',
    isError,
    isFetched: !isLoading,
    isFetchedAfterMount: !isLoading,
    isFetching,
    isInitialLoading: isLoading,
    isLoading,
    isLoadingError: isError && isLoading,
    isPaused: false,
    isPending: isLoading,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching,
    isStale: false,
    isSuccess,
    refetch,
    status,
  } as UseQueryResult<TData>;
}

/**
 * Creates a mock mutation result for testing React Query mutation hooks.
 * @param options - Options to configure the mock mutation result
 * @returns A mock UseMutationResult object
 */
export function createMockMutationResult<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: {
    data?: TData;
    error?: TError | null;
    isPending?: boolean;
    isError?: boolean;
    isSuccess?: boolean;
    isIdle?: boolean;
    status?: 'idle' | 'pending' | 'error' | 'success';
    mutate?: (variables: TVariables, options?: unknown) => void;
    mutateAsync?: (variables: TVariables, options?: unknown) => Promise<TData>;
    reset?: () => void;
  } = {},
): UseMutationResult<TData, TError, TVariables, TContext> {
  const {
    data,
    error = null,
    isPending = false,
    isError = false,
    isSuccess = data !== undefined && !isError && !isPending,
    isIdle = !isPending && !isError && !isSuccess,
    status = isIdle ? 'idle' : isPending ? 'pending' : isError ? 'error' : 'success',
    mutate = vi.fn(),
    mutateAsync = vi.fn().mockResolvedValue(data as TData),
    reset = vi.fn(),
  } = options;

  return {
    context: undefined,
    data,
    error,
    failureCount: isError ? 1 : 0,
    failureReason: error,
    isError,
    isIdle,
    isPaused: false,
    isPending,
    isSuccess,
    mutate,
    mutateAsync,
    reset,
    status,
    submittedAt: isPending || isSuccess ? Date.now() : undefined,
    variables: undefined,
  } as UseMutationResult<TData, TError, TVariables, TContext>;
}
