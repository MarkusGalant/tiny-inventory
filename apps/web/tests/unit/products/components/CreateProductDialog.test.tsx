import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CreateProductDialog } from '@/features/products/components/CreateProductDialog';
import { useCreateProduct } from '@/features/products/hooks/useProductMutations';

import { createMockMutationResult } from '../../../utils/test-utils';

vi.mock('@/features/products/hooks/useProductMutations', () => ({ useCreateProduct: vi.fn() }));
vi.mock('@/features/products/hooks/useCategories', () => ({
  useCategories: () => ['Electronics', 'Accessories', 'Furniture', 'Stationery', 'Travel'],
}));

const mockEnqueueSnackbar = vi.fn();

vi.mock('notistack', async (importOriginal) => {
  const actual = await importOriginal<typeof import('notistack')>();
  return {
    ...actual,
    useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar }),
  };
});

describe('CreateProductDialog', () => {
  const mockOnClose = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnqueueSnackbar.mockClear();
    vi.mocked(useCreateProduct).mockReturnValue(
      createMockMutationResult({ mutateAsync: mockMutateAsync, isPending: false }),
    );
  });

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateProductDialog onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('product-form-name-input')).toBeInTheDocument();
    });

    const cancelButton = screen.getByTestId('create-product-dialog-cancel-button');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('validates required fields on submit', async () => {
    const user = userEvent.setup();
    render(<CreateProductDialog onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('product-form-name-input')).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId('create-product-dialog-submit-button');
    await user.click(submitButton);

    expect(mockMutateAsync).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('allows user to fill form fields', async () => {
    const user = userEvent.setup();
    render(<CreateProductDialog onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('product-form-name-input')).toBeInTheDocument();
    });

    const nameInput = screen.getByTestId('product-form-name-input');
    const categorySelect = screen.getByTestId('product-form-category-select');
    const priceInput = screen.getByTestId('product-form-price-input') as HTMLInputElement;
    const stockInput = screen.getByTestId('product-form-stock-quantity-input') as HTMLInputElement;

    await user.type(nameInput, 'Test Product');
    // Find the combobox within the testid element
    const combobox = within(categorySelect).getByRole('combobox');
    await user.click(combobox);
    const electronicsOption = await screen.findByText('Electronics');
    await user.click(electronicsOption);
    await user.clear(priceInput);
    await user.type(priceInput, '99.99');
    await user.clear(stockInput);
    await user.type(stockInput, '10');

    expect(nameInput).toHaveValue('Test Product');
    expect(priceInput.value).toBe('99.99');
    expect(stockInput.value).toBe('10');
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    });

    vi.mocked(useCreateProduct).mockReturnValue(
      createMockMutationResult({ mutateAsync: mockMutateAsync, isPending: true }),
    );

    render(<CreateProductDialog onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('product-form-name-input')).toBeInTheDocument();
    });

    const nameInput = screen.getByTestId('product-form-name-input');
    const submitButton = screen.getByTestId('create-product-dialog-submit-button');

    await user.type(nameInput, 'Test Product');
    expect(submitButton).toBeDisabled();
  });
});
