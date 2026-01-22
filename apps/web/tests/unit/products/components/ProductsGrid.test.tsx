import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ProductsGrid } from '@/features/products/components/ProductsGrid';
import { useProductList } from '@/features/products/hooks/useProducts';
import type { Product, ProductListQuery } from '@/features/products/types';

import { createMockQueryResult } from '../../../utils/test-utils';

vi.mock('@/features/products/hooks/useProducts', () => ({ useProductList: vi.fn() }));

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Product 1',
    category: 'Electronics',
    price: 99.99,
    stockQuantity: 10,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Product 2',
    category: 'Accessories',
    price: 49.99,
    stockQuantity: 5,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
];

describe('ProductsGrid', () => {
  const mockQuery: ProductListQuery = { skip: 0, take: 10 };
  const mockOnPaginationChange = vi.fn();
  const mockRefetch = vi.fn();
  const getActions = vi.fn(() => []);

  beforeEach(() => {
    vi.clearAllMocks();
    mockRefetch.mockResolvedValue({});
    vi.mocked(useProductList).mockReturnValue(
      createMockQueryResult({
        data: { items: mockProducts, total: 2 },
        refetch: mockRefetch,
      }),
    );
  });

  it('calls onPaginationChange when pagination changes', () => {
    render(
      <ProductsGrid
        query={mockQuery}
        getActions={getActions}
        onPaginationChange={mockOnPaginationChange}
      />,
    );

    const grid = screen.getByTestId('products-grid');
    expect(grid).toBeInTheDocument();
  });

  it('renders without actions column when getActions is not provided', () => {
    render(<ProductsGrid query={mockQuery} onPaginationChange={mockOnPaginationChange} />);

    const grid = screen.getByTestId('products-grid');
    expect(grid).toBeInTheDocument();
  });

  it('calls refetch when retry button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(useProductList).mockReturnValue(
      createMockQueryResult({
        isError: true,
        error: new Error('Failed to load products'),
        isSuccess: false,
        refetch: mockRefetch,
      }),
    );

    render(
      <ProductsGrid
        query={mockQuery}
        getActions={getActions}
        onPaginationChange={mockOnPaginationChange}
      />,
    );

    const retryButton = screen.getByTestId('products-grid-retry-button');
    await user.click(retryButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  it('does not render the actions column when getActions is not provided', () => {
    render(<ProductsGrid query={mockQuery} onPaginationChange={mockOnPaginationChange} />);

    expect(screen.queryByTestId('products-grid-actions-header')).not.toBeInTheDocument();
  });
});
