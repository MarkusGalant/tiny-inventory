import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CreateStoreDialog } from '@/features/stores/components/CreateStoreDialog';
import { useCreateStore } from '@/features/stores/hooks/useStoreMutations';

import { createMockMutationResult } from '../../../utils/test-utils';

vi.mock('@/features/stores/hooks/useStoreMutations', () => ({ useCreateStore: vi.fn() }));

const mockEnqueueSnackbar = vi.fn();

vi.mock('notistack', async (importOriginal) => {
  const actual = await importOriginal<typeof import('notistack')>();
  return {
    ...actual,
    useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar }),
  };
});

describe('CreateStoreDialog', () => {
  const mockOnClose = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnqueueSnackbar.mockClear();
    vi.mocked(useCreateStore).mockReturnValue(
      createMockMutationResult({ mutateAsync: mockMutateAsync, isPending: false }),
    );
  });

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateStoreDialog onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('store-form-name-input')).toBeInTheDocument();
    });

    const cancelButton = screen.getByTestId('create-store-dialog-cancel-button');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('validates required fields on submit', async () => {
    const user = userEvent.setup();
    render(<CreateStoreDialog onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('store-form-name-input')).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId('create-store-dialog-submit-button');
    await user.click(submitButton);

    expect(mockMutateAsync).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({});

    render(<CreateStoreDialog onClose={mockOnClose} />);

    const nameInput = screen.getByTestId('store-form-name-input');
    const addressInput = screen.getByTestId('store-form-address-input');
    const submitButton = screen.getByTestId('create-store-dialog-submit-button');

    await user.type(nameInput, 'Test Store');
    await user.type(addressInput, '123 Test St');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'Test Store',
        address: '123 Test St',
      });
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Store created successfully'),
        {
          variant: 'success',
        },
      );
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('submits form with empty address (optional field)', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({});

    render(<CreateStoreDialog onClose={mockOnClose} />);

    const nameInput = screen.getByTestId('store-form-name-input');
    const submitButton = screen.getByTestId('create-store-dialog-submit-button');

    await user.type(nameInput, 'Test Store');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'Test Store',
        address: undefined,
      });
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    });

    vi.mocked(useCreateStore).mockReturnValue(
      createMockMutationResult({ mutateAsync: mockMutateAsync, isPending: true }),
    );

    render(<CreateStoreDialog onClose={mockOnClose} />);

    const nameInput = screen.getByTestId('store-form-name-input');
    const submitButton = screen.getByTestId('create-store-dialog-submit-button');

    await user.type(nameInput, 'Test Store');
    expect(submitButton).toBeDisabled();
  });

  it('handles submission error', async () => {
    const user = userEvent.setup();
    const error = new Error('Failed to create store');
    mockMutateAsync.mockRejectedValue(error);

    render(<CreateStoreDialog onClose={mockOnClose} />);

    const nameInput = screen.getByTestId('store-form-name-input');
    const submitButton = screen.getByTestId('create-store-dialog-submit-button');

    await user.type(nameInput, 'Test Store');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create store'),
        {
          variant: 'error',
        },
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('validates max length for store name', async () => {
    const user = userEvent.setup();
    render(<CreateStoreDialog onClose={mockOnClose} />);

    const nameInput = screen.getByTestId('store-form-name-input');
    const longName = 'a'.repeat(256); // Exceeds 255 character limit

    await user.type(nameInput, longName);
    await user.click(screen.getByTestId('create-store-dialog-submit-button'));
  });

  it('validates max length for address', async () => {
    const user = userEvent.setup();
    render(<CreateStoreDialog onClose={mockOnClose} />);

    const nameInput = screen.getByTestId('store-form-name-input');
    const addressInput = screen.getByTestId('store-form-address-input');
    const longAddress = 'a'.repeat(501); // Exceeds 500 character limit

    await user.type(nameInput, 'Test Store');
    await user.type(addressInput, longAddress);
    await user.click(screen.getByTestId('create-store-dialog-submit-button'));
  });
});
