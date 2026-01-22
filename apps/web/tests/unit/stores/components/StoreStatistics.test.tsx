import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { StoreStatistics } from '@/features/stores/components/StoreStatistics';
import { useStoreStatistics } from '@/features/stores/hooks/useStores';

import { createMockQueryResult } from '../../../utils/test-utils';

vi.mock('@/features/stores/hooks/useStores', () => ({ useStoreStatistics: vi.fn() }));
vi.mock('@/utils', () => ({
  formatCurrency: (v: number) => `$${v.toFixed(2)}`,
  formatNumber: (v: number) => v.toLocaleString(),
}));

const mockStatistics = {
  totalProductCount: 10,
  totalStockQuantity: 100,
  totalInventoryValue: 5000.5,
  averageProductPrice: 500.05,
};

describe('StoreStatistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useStoreStatistics).mockReturnValue(
      createMockQueryResult({
        data: mockStatistics,
      }),
    );
  });

  it('handles zero values correctly', () => {
    vi.mocked(useStoreStatistics).mockReturnValue(
      createMockQueryResult({
        data: {
          totalProductCount: 0,
          totalStockQuantity: 0,
          totalInventoryValue: 0,
          averageProductPrice: 0,
        },
      }),
    );

    render(<StoreStatistics storeId="store-1" />);

    expect(screen.getByTestId('store-statistics-total-product-count-value')).toHaveTextContent('0');
    expect(screen.getByTestId('store-statistics-total-stock-quantity-value')).toHaveTextContent(
      '0',
    );
    expect(screen.getByTestId('store-statistics-total-inventory-value')).toHaveTextContent('$0.00');
    expect(screen.getByTestId('store-statistics-average-product-price-value')).toHaveTextContent(
      '$0.00',
    );
  });

  it('calls useStoreStatistics with correct storeId', () => {
    render(<StoreStatistics storeId="test-store-id" />);

    expect(useStoreStatistics).toHaveBeenCalledWith('test-store-id');
  });
});
