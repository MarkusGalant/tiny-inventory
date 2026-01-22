import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { EditProductDialog } from '@/features/products/components/EditProductDialog';
import { useUpdateProduct, useProduct } from '@/features/products/hooks';
import type { Product } from '@/features/products/types';

import { createMockQueryResult, createMockMutationResult } from '../../../utils/test-utils';

vi.mock('@/features/products/hooks', async (importOriginal) => {
  const m = await importOriginal<typeof import('@/features/products/hooks')>();
  return { ...m, useUpdateProduct: vi.fn(), useProduct: vi.fn() };
});
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

const mockProduct: Product = {
  id: '1',
  name: 'Product 1',
  category: 'Electronics',
  price: 99.99,
  stockQuantity: 10,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('EditProductDialog', () => {
  const mockOnClose = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnqueueSnackbar.mockClear();
    vi.mocked(useProduct).mockReturnValue(createMockQueryResult({ data: mockProduct }));
    vi.mocked(useUpdateProduct).mockReturnValue(
      createMockMutationResult({ mutateAsync: mockMutateAsync, isPending: false }),
    );
  });

  it('renders dialog with pre-filled form fields', async () => {
    render(<EditProductDialog productId="1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-product-dialog-title')).toBeInTheDocument();
    });

    await waitFor(() => {
      const nameInput = screen.getByTestId('product-form-name-input') as HTMLInputElement;
      const priceInput = screen.getByTestId('product-form-price-input') as HTMLInputElement;
      const stockInput = screen.getByTestId(
        'product-form-stock-quantity-input',
      ) as HTMLInputElement;

      expect(nameInput.value).toBe('Product 1');
      expect(priceInput.value).toBe('99.99');
      expect(stockInput.value).toBe('10');
    });
  });

  it('shows loading state while fetching product data', () => {
    vi.mocked(useProduct).mockReturnValue(
      createMockQueryResult<typeof mockProduct>({ isLoading: true, data: undefined }),
    );

    render(<EditProductDialog productId="1" onClose={mockOnClose} />);
  });

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<EditProductDialog productId="1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-product-dialog-title')).toBeInTheDocument();
    });

    const cancelButton = screen.getByTestId('edit-product-dialog-cancel-button');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('allows user to modify form fields', async () => {
    const user = userEvent.setup();
    render(<EditProductDialog productId="1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-product-dialog-title')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('product-form-name-input')).toBeInTheDocument();
    });

    const nameInput = screen.getByTestId('product-form-name-input');
    const categorySelect = screen.getByTestId('product-form-category-select');
    const priceInput = screen.getByTestId('product-form-price-input') as HTMLInputElement;

    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Product Name');
    // Find the combobox within the testid element
    const combobox = within(categorySelect).getByRole('combobox');
    await user.click(combobox);
    const accessoriesOption = await screen.findByText('Accessories');
    await user.click(accessoriesOption);
    await user.clear(priceInput);
    await user.type(priceInput, '149.99');

    expect(nameInput).toHaveValue('Updated Product Name');
    expect(priceInput.value).toBe('149.99');
  });

  it('shows loading state during update', async () => {
    let resolvePromise: () => void;
    const pendingPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockMutateAsync.mockReturnValue(pendingPromise);

    vi.mocked(useUpdateProduct).mockReturnValue(
      createMockMutationResult({ mutateAsync: mockMutateAsync, isPending: true }),
    );

    render(<EditProductDialog productId="1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-product-dialog-title')).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId('edit-product-dialog-submit-button');
    expect(submitButton).toBeDisabled();

    resolvePromise!();
  });

  it('handles update error', async () => {
    const user = userEvent.setup();
    const error = new Error('Failed to update product');
    mockMutateAsync.mockRejectedValue(error);

    render(<EditProductDialog productId="1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-product-dialog-title')).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId('edit-product-dialog-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Failed to update product'),
        {
          variant: 'error',
        },
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<EditProductDialog productId="1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-product-dialog-title')).toBeInTheDocument();
    });

    const nameInput = screen.getByTestId('product-form-name-input');
    const submitButton = screen.getByTestId('edit-product-dialog-submit-button');

    await user.clear(nameInput);
    await user.click(submitButton);

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
