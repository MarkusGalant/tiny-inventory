import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, it, expect, vi } from 'vitest';

import { StoreForm } from '@/features/stores/components/StoreForm';
import { storeFormSchema } from '@/features/stores/validation.schema';
import type { StoreFormSchema } from '@/features/stores/validation.schema';

function Wrapper({
  children,
  defaultValues = { name: '', address: '' },
}: {
  children: React.ReactNode;
  defaultValues?: { name: string; address: string };
}) {
  const form = useForm<StoreFormSchema>({
    resolver: zodResolver(storeFormSchema),
    defaultValues,
  });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe('StoreForm', () => {
  it('displays default values', () => {
    render(
      <Wrapper defaultValues={{ name: 'Test Store', address: '123 Test St' }}>
        <StoreForm />
      </Wrapper>,
    );

    const nameInput = screen.getByTestId('store-form-name-input');
    const addressInput = screen.getByTestId('store-form-address-input');

    expect(nameInput).toHaveValue('Test Store');
    expect(addressInput).toHaveValue('123 Test St');
  });

  it('allows user to type in name field', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <StoreForm />
      </Wrapper>,
    );

    const nameInput = screen.getByTestId('store-form-name-input');
    await user.type(nameInput, 'New Store Name');

    expect(nameInput).toHaveValue('New Store Name');
  });

  it('allows user to type in address field', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <StoreForm />
      </Wrapper>,
    );

    const addressInput = screen.getByTestId('store-form-address-input');
    await user.type(addressInput, '456 New Address');

    expect(addressInput).toHaveValue('456 New Address');
  });

  it('disables fields when isLoading is true', async () => {
    render(
      <Wrapper>
        <StoreForm isLoading={true} />
      </Wrapper>,
    );

    const nameInput = screen.getByTestId('store-form-name-input');
    const addressInput = screen.getByTestId('store-form-address-input');

    expect(nameInput).toBeDisabled();
    expect(addressInput).toBeDisabled();
  });

  it('enables fields when isLoading is false', async () => {
    render(
      <Wrapper>
        <StoreForm isLoading={false} />
      </Wrapper>,
    );

    const nameInput = screen.getByTestId('store-form-name-input');
    const addressInput = screen.getByTestId('store-form-address-input');

    expect(nameInput).not.toBeDisabled();
    expect(addressInput).not.toBeDisabled();
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e) => e.preventDefault());

    render(
      <Wrapper>
        <StoreForm onSubmit={onSubmit} />
      </Wrapper>,
    );

    const nameInput = screen.getByTestId('store-form-name-input');
    const addressInput = screen.getByTestId('store-form-address-input');
    const form = nameInput.closest('form')!;

    await user.type(nameInput, 'Test Store');
    await user.type(addressInput, '123 Test St');
    await user.click(form);

    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);

    expect(onSubmit).toHaveBeenCalled();
  });

  it('accepts custom form id and can be submitted from outside', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e) => e.preventDefault());

    render(
      <Wrapper>
        <StoreForm id="custom-form-id" onSubmit={onSubmit} />
        <button type="submit" form="custom-form-id" data-testid="store-form-outside-submit-button">
          Submit Outside
        </button>
      </Wrapper>,
    );

    const form = screen.getByTestId('store-form');
    expect(form).toHaveAttribute('id', 'custom-form-id');

    const nameInput = screen.getByTestId('store-form-name-input');
    const submitButton = screen.getByTestId('store-form-outside-submit-button');

    await user.type(nameInput, 'Test Store');
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalled();
  });
});
