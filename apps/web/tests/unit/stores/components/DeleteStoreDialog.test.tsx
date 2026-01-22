import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DeleteStoreDialog } from '@/features/stores/components/DeleteStoreDialog';
import { useDeleteStore } from '@/features/stores/hooks';

import { createMockMutationResult } from '../../../utils/test-utils';

vi.mock('@/features/stores/hooks', () => ({
  useDeleteStore: vi.fn(),
}));

const mockEnqueueSnackbar = vi.fn();

vi.mock('notistack', async (importOriginal) => {
  const actual = await importOriginal<typeof import('notistack')>();
  return {
    ...actual,
    useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar }),
  };
});

describe('DeleteStoreDialog', () => {
  const mockOnClose = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnqueueSnackbar.mockClear();
    vi.mocked(useDeleteStore).mockReturnValue(
      createMockMutationResult({ mutateAsync: mockMutateAsync, isPending: false }),
    );
  });

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteStoreDialog storeId="store-1" onClose={mockOnClose} />);

    const cancelButton = screen.getByTestId('delete-store-dialog-cancel-button');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('deletes store when delete button is clicked', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({});

    render(<DeleteStoreDialog storeId="store-1" onClose={mockOnClose} />);

    const deleteButton = screen.getByTestId('delete-store-dialog-submit-button');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ id: 'store-1' });
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Store deleted successfully'),
        {
          variant: 'success',
        },
      );
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('shows loading state during deletion', async () => {
    mockMutateAsync.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    });

    vi.mocked(useDeleteStore).mockReturnValue(
      createMockMutationResult({ mutateAsync: mockMutateAsync, isPending: true }),
    );

    render(<DeleteStoreDialog storeId="store-1" onClose={mockOnClose} />);

    const deleteButton = screen.getByTestId('delete-store-dialog-submit-button');
    expect(deleteButton).toBeDisabled();

    const cancelButton = screen.getByTestId('delete-store-dialog-cancel-button');
    expect(cancelButton).toBeDisabled();
  });

  it('handles deletion error', async () => {
    const user = userEvent.setup();
    const error = new Error('Failed to delete store');
    mockMutateAsync.mockRejectedValue(error);

    render(<DeleteStoreDialog storeId="store-1" onClose={mockOnClose} />);

    const deleteButton = screen.getByTestId('delete-store-dialog-submit-button');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ id: 'store-1' });
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Failed to delete store'),
        {
          variant: 'error',
        },
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('disables buttons when pending', () => {
    vi.mocked(useDeleteStore).mockReturnValue(
      createMockMutationResult({ mutateAsync: mockMutateAsync, isPending: true }),
    );

    render(<DeleteStoreDialog storeId="store-1" onClose={mockOnClose} />);

    const deleteButton = screen.getByTestId('delete-store-dialog-submit-button');
    const cancelButton = screen.getByTestId('delete-store-dialog-cancel-button');

    expect(deleteButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });
});
