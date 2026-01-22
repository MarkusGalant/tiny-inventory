import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { EditStoreDialog } from '@/features/stores/components/EditStoreDialog';
import { useUpdateStore, useStore } from '@/features/stores/hooks';

import { createMockQueryResult, createMockMutationResult } from '../../../utils/test-utils';

vi.mock('@/features/stores/hooks', () => ({
  useUpdateStore: vi.fn(),
  useStore: vi.fn(),
}));

const mockEnqueueSnackbar = vi.fn();

vi.mock('notistack', async (importOriginal) => {
  const actual = await importOriginal<typeof import('notistack')>();
  return {
    ...actual,
    useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar }),
  };
});

const mockStore = {
  id: '1',
  name: 'Store 1',
  address: '123 Main St',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('EditStoreDialog', () => {
  const mockOnClose = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnqueueSnackbar.mockClear();
    vi.mocked(useStore).mockReturnValue(createMockQueryResult({ data: mockStore }));
    vi.mocked(useUpdateStore).mockReturnValue(
      createMockMutationResult({ mutateAsync: mockMutateAsync, isPending: false }),
    );
  });

  it('renders dialog with pre-filled form fields', async () => {
    render(<EditStoreDialog storeId="1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-store-dialog-title')).toBeInTheDocument();
    });

    await waitFor(() => {
      const nameInput = screen.getByTestId('store-form-name-input') as HTMLInputElement;
      const addressInput = screen.getByTestId('store-form-address-input') as HTMLInputElement;

      expect(nameInput.value).toBe('Store 1');
      expect(addressInput.value).toBe('123 Main St');
    });
  });

  it('handles store with null address', async () => {
    const storeWithoutAddress = { ...mockStore, address: null };
    vi.mocked(useStore).mockReturnValue(createMockQueryResult({ data: storeWithoutAddress }));

    render(<EditStoreDialog storeId="1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-store-dialog-title')).toBeInTheDocument();
    });

    const addressInput = screen.getByTestId('store-form-address-input') as HTMLInputElement;
    expect(addressInput.value).toBe('');
  });

  it('shows loading state while fetching store data', () => {
    vi.mocked(useStore).mockReturnValue(
      createMockQueryResult<typeof mockStore>({ isLoading: true, data: undefined }),
    );

    render(<EditStoreDialog storeId="1" onClose={mockOnClose} />);
  });

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<EditStoreDialog storeId="1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-store-dialog-title')).toBeInTheDocument();
    });

    const cancelButton = screen.getByTestId('edit-store-dialog-cancel-button');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('updates store with modified data', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({});

    render(<EditStoreDialog storeId="1" onClose={mockOnClose} />);

    expect(screen.getByTestId('edit-store-dialog-title')).toBeInTheDocument();

    const nameInput = screen.getByTestId('store-form-name-input');
    const addressInput = screen.getByTestId('store-form-address-input');
    const submitButton = screen.getByTestId('edit-store-dialog-submit-button');

    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Store Name');
    await user.clear(addressInput);
    await user.type(addressInput, '456 New St');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: '1',
        data: {
          name: 'Updated Store Name',
          address: '456 New St',
        },
      });
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Store updated successfully'),
        {
          variant: 'success',
        },
      );
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('submits with empty address when address is cleared', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({});

    render(<EditStoreDialog storeId="1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-store-dialog-title')).toBeInTheDocument();
    });

    const addressInput = screen.getByTestId('store-form-address-input');
    const submitButton = screen.getByTestId('edit-store-dialog-submit-button');

    await user.clear(addressInput);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: '1',
        data: {
          name: 'Store 1',
          address: undefined,
        },
      });
    });
  });

  it('shows loading state during update', async () => {
    let resolvePromise: () => void;
    const pendingPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockMutateAsync.mockReturnValue(pendingPromise);

    vi.mocked(useUpdateStore).mockReturnValue(
      createMockMutationResult({ mutateAsync: mockMutateAsync, isPending: true }),
    );

    render(<EditStoreDialog storeId="1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-store-dialog-title')).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId('edit-store-dialog-submit-button');
    expect(submitButton).toBeDisabled();

    resolvePromise!();
  });

  it('handles update error', async () => {
    const user = userEvent.setup();
    const error = new Error('Failed to update store');
    mockMutateAsync.mockRejectedValue(error);

    render(<EditStoreDialog storeId="1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-store-dialog-title')).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId('edit-store-dialog-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Failed to update store'),
        {
          variant: 'error',
        },
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<EditStoreDialog storeId="1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-store-dialog-title')).toBeInTheDocument();
    });

    const nameInput = screen.getByTestId('store-form-name-input');
    const submitButton = screen.getByTestId('edit-store-dialog-submit-button');

    await user.clear(nameInput);
    await user.click(submitButton);

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
