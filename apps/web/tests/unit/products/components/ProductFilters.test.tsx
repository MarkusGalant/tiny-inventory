import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ProductFilters } from '@/features/products/components/ProductFilters';

vi.mock('@/features/products/hooks/useCategories', () => ({
  useCategories: () => ['Electronics', 'Accessories', 'Furniture', 'Stationery', 'Travel'],
}));

describe('ProductFilters', () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays initial filter values', () => {
    render(
      <ProductFilters
        filter={{ search: 'test search', category: 'Electronics', minPrice: 10, maxPrice: 100 }}
        onFilterChange={mockOnFilterChange}
      />,
    );

    const searchInput = screen.getByTestId('product-filters-search-input') as HTMLInputElement;
    const minPriceInput = screen.getByTestId('product-filters-min-price-input') as HTMLInputElement;
    const maxPriceInput = screen.getByTestId('product-filters-max-price-input') as HTMLInputElement;

    expect(searchInput.value).toBe('test search');
    expect(minPriceInput.value).toBe('10');
    expect(maxPriceInput.value).toBe('100');
  });

  it('applies filter when form is submitted', async () => {
    const user = userEvent.setup();
    render(
      <ProductFilters
        filter={{ search: '', category: '', minPrice: undefined, maxPrice: undefined }}
        onFilterChange={mockOnFilterChange}
      />,
    );

    const searchInput = screen.getByTestId('product-filters-search-input');
    const categorySelect = screen.getByTestId('product-filters-category-select');
    const minPriceInput = screen.getByTestId('product-filters-min-price-input');
    const applyButton = screen.getByTestId('product-filters-apply-button');

    await user.type(searchInput, 'test product');
    // Find the combobox within the testid element
    const combobox = within(categorySelect).getByRole('combobox');
    await user.click(combobox);
    const electronicsOption = await screen.findByText('Electronics');
    await user.click(electronicsOption);
    await user.type(minPriceInput, '10');
    await user.click(applyButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      search: 'test product',
      category: 'Electronics',
      minPrice: 10,
      maxPrice: undefined,
    });
  });

  it('clears filter when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProductFilters
        filter={{ search: 'existing search', category: 'Electronics', minPrice: 10, maxPrice: 100 }}
        onFilterChange={mockOnFilterChange}
      />,
    );

    const clearButton = screen.getByTestId('product-filters-clear-button');
    await user.click(clearButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      search: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  });

  it('handles empty search input as undefined', async () => {
    const user = userEvent.setup();
    render(
      <ProductFilters
        filter={{ search: '', category: '', minPrice: undefined, maxPrice: undefined }}
        onFilterChange={mockOnFilterChange}
      />,
    );

    const applyButton = screen.getByTestId('product-filters-apply-button');
    await user.click(applyButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      search: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  });

  it('handles "all" category as undefined', async () => {
    const user = userEvent.setup();
    render(
      <ProductFilters
        filter={{ search: '', category: 'all', minPrice: undefined, maxPrice: undefined }}
        onFilterChange={mockOnFilterChange}
      />,
    );

    const applyButton = screen.getByTestId('product-filters-apply-button');
    await user.click(applyButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      search: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  });
});
