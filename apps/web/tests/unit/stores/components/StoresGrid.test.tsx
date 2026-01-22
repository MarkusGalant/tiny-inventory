import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { StoresGrid } from '@/features/stores/components/StoresGrid';
import { useStoreList } from '@/features/stores/hooks/useStores';
import type { Store, StoreList, StoreListQuery } from '@/features/stores/types';

import { createMockQueryResult } from '../../../utils/test-utils';

const mockNavigate = vi.fn();

vi.mock('@/features/stores/hooks/useStores', () => ({ useStoreList: vi.fn() }));
vi.mock('react-router-dom', async (importOriginal) => {
  const m = await importOriginal<typeof import('react-router-dom')>();
  return { ...m, useNavigate: () => mockNavigate };
});

const mockStores: StoreList | undefined = {
  items: [
    {
      id: '1',
      name: 'Store 1',
      address: '123 Main St',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'Store 2',
      address: null,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ] satisfies Store[],
  total: 2,
};

describe('StoresGrid', () => {
  const mockQuery: StoreListQuery = { page: 1, limit: 10 };
  const mockOnPaginationChange = vi.fn();
  const mockRefetch = vi.fn();
  const getActions = vi.fn(() => []);

  beforeEach(() => {
    vi.clearAllMocks();
    mockRefetch.mockResolvedValue({});
    vi.mocked(useStoreList).mockReturnValue(
      createMockQueryResult({
        data: mockStores,
        refetch: mockRefetch,
      }),
    );
  });

  it('displays placeholder for null address', () => {
    render(
      <StoresGrid
        query={mockQuery}
        getActions={getActions}
        onPaginationChange={mockOnPaginationChange}
      />,
    );

    const grid = screen.getByTestId('stores-grid');
    expect(grid).toBeInTheDocument();
    const addressCell = screen.getByTestId('stores-grid-address-2');
    expect(addressCell).toHaveTextContent('—');
  });

  it('navigates to store detail when row is clicked', async () => {
    const user = userEvent.setup();
    render(
      <StoresGrid
        query={mockQuery}
        getActions={getActions}
        onPaginationChange={mockOnPaginationChange}
      />,
    );

    const store1Cell = screen.getByTestId('stores-grid-name-1');
    expect(store1Cell).toBeInTheDocument();
    await user.click(store1Cell);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/stores/1');
    });
  });

  it('calls onPaginationChange when pagination changes', () => {
    render(
      <StoresGrid
        query={mockQuery}
        getActions={getActions}
        onPaginationChange={mockOnPaginationChange}
      />,
    );

    const grid = screen.getByTestId('stores-grid');
    expect(grid).toBeInTheDocument();
  });

  it('calls refetch when retry button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(useStoreList).mockReturnValue(
      createMockQueryResult({
        isError: true,
        error: new Error('Failed to load stores'),
        isSuccess: false,
        refetch: mockRefetch,
      }),
    );

    render(
      <StoresGrid
        query={mockQuery}
        getActions={getActions}
        onPaginationChange={mockOnPaginationChange}
      />,
    );

    const retryButton = screen.getByTestId('stores-grid-retry-button');
    await user.click(retryButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  it('renders without actions column when getActions is not provided', () => {
    render(<StoresGrid query={mockQuery} onPaginationChange={mockOnPaginationChange} />);

    expect(screen.queryByTestId('stores-grid-actions-header')).not.toBeInTheDocument();
  });
});
