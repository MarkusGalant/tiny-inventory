import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { StoreFilters } from '@/features/stores/components/StoreFilters';

describe('StoreFilters', () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays initial filter value', () => {
    render(<StoreFilters filter={{ search: 'test search' }} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByTestId('store-filters-search-input') as HTMLInputElement;
    expect(searchInput.value).toBe('test search');
  });

  it('applies filter when form is submitted', async () => {
    const user = userEvent.setup();
    render(<StoreFilters filter={{ search: '' }} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByTestId('store-filters-search-input');
    const applyButton = screen.getByTestId('store-filters-apply-button');

    await user.type(searchInput, 'test store');
    await user.click(applyButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({ search: 'test store' });
  });

  it('trims whitespace from search input', async () => {
    const user = userEvent.setup();
    render(<StoreFilters filter={{ search: '' }} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByTestId('store-filters-search-input');
    const applyButton = screen.getByTestId('store-filters-apply-button');

    await user.type(searchInput, '  test store  ');
    await user.click(applyButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({ search: 'test store' });
  });

  it('clears filter when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <StoreFilters filter={{ search: 'existing search' }} onFilterChange={mockOnFilterChange} />,
    );

    const clearButton = screen.getByTestId('store-filters-clear-button');
    await user.click(clearButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({ search: undefined });
    const searchInput = screen.getByTestId('store-filters-search-input') as HTMLInputElement;
    expect(searchInput.value).toBe('');
  });

  it('handles empty search input as undefined', async () => {
    const user = userEvent.setup();
    render(<StoreFilters filter={{ search: '' }} onFilterChange={mockOnFilterChange} />);

    const applyButton = screen.getByTestId('store-filters-apply-button');
    await user.click(applyButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({ search: undefined });
  });

  it('handles filter with only whitespace', async () => {
    const user = userEvent.setup();
    render(<StoreFilters filter={{ search: '' }} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByTestId('store-filters-search-input');
    const applyButton = screen.getByTestId('store-filters-apply-button');

    await user.type(searchInput, '   ');
    await user.click(applyButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({ search: undefined });
  });

  it('updates input value when typing', async () => {
    const user = userEvent.setup();
    render(<StoreFilters filter={{ search: '' }} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByTestId('store-filters-search-input') as HTMLInputElement;

    await user.type(searchInput, 'new search');

    expect(searchInput.value).toBe('new search');
  });

  it('submits form on Enter key press', async () => {
    const user = userEvent.setup();
    render(<StoreFilters filter={{ search: '' }} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByTestId('store-filters-search-input');
    await user.type(searchInput, 'test search{Enter}');

    expect(mockOnFilterChange).toHaveBeenCalledWith({ search: 'test search' });
  });
});
