import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, it, expect, vi } from 'vitest';

import { ProductForm } from '@/features/products/components/ProductForm';
import { productFormSchema } from '@/features/products/validation.schemas';
import type { ProductFormSchema } from '@/features/products/validation.schemas';

vi.mock('@/features/products/hooks/useCategories', () => ({
  useCategories: () => ['Electronics', 'Accessories', 'Furniture', 'Stationery', 'Travel'],
}));

function Wrapper({
  children,
  defaultValues = { name: '', category: '', price: 0, stockQuantity: 0 },
}: {
  children: React.ReactNode;
  defaultValues?: { name: string; category: string; price: number; stockQuantity: number };
}) {
  const form = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}

describe('ProductForm', () => {
  it('displays default values', async () => {
    render(
      <Wrapper
        defaultValues={{
          name: 'Test Product',
          category: 'Electronics',
          price: 99.99,
          stockQuantity: 10,
        }}
      >
        <ProductForm />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('product-form-name-input')).toHaveValue('Test Product');
      expect(screen.getByTestId('product-form-price-input')).toHaveValue('99.99');
      expect(screen.getByTestId('product-form-stock-quantity-input')).toHaveValue('10');
    });
  });

  it('allows user to type in name field', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <ProductForm />
      </Wrapper>,
    );

    const nameInput = screen.getByTestId('product-form-name-input');
    await user.type(nameInput, 'New Product Name');

    expect((nameInput as HTMLInputElement).value).toBe('New Product Name');
  });

  it('allows user to type in price field', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <ProductForm />
      </Wrapper>,
    );

    const priceInput = screen.getByTestId('product-form-price-input') as HTMLInputElement;
    await user.clear(priceInput);
    await user.type(priceInput, '149.99');

    expect(priceInput.value).toBe('149.99');
  });

  it('allows user to type in stock quantity field', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <ProductForm />
      </Wrapper>,
    );

    const stockInput = screen.getByTestId('product-form-stock-quantity-input') as HTMLInputElement;
    await user.clear(stockInput);
    await user.type(stockInput, '20');

    expect(stockInput.value).toBe('20');
  });

  it('disables fields when isLoading is true', () => {
    render(
      <Wrapper>
        <ProductForm isLoading={true} />
      </Wrapper>,
    );

    const nameInput = screen.getByTestId('product-form-name-input');
    const categorySelect = screen.getByTestId('product-form-category-select');
    const categorySelectInput = within(categorySelect).getByRole('combobox');
    const priceInput = screen.getByTestId('product-form-price-input');
    const stockInput = screen.getByTestId('product-form-stock-quantity-input');

    expect(nameInput).toBeDisabled();
    expect(categorySelectInput).toHaveAttribute('aria-disabled', 'true');
    expect(priceInput).toBeDisabled();
    expect(stockInput).toBeDisabled();
  });

  it('enables fields when isLoading is false', () => {
    render(
      <Wrapper>
        <ProductForm isLoading={false} />
      </Wrapper>,
    );

    const nameInput = screen.getByTestId('product-form-name-input');
    const categorySelect = screen.getByTestId('product-form-category-select');
    const categorySelectInput = within(categorySelect).getByRole('combobox');
    const priceInput = screen.getByTestId('product-form-price-input');
    const stockInput = screen.getByTestId('product-form-stock-quantity-input');

    expect(nameInput).not.toBeDisabled();
    expect(categorySelectInput).not.toHaveAttribute('aria-disabled', 'true');
    expect(priceInput).not.toBeDisabled();
    expect(stockInput).not.toBeDisabled();
  });

  it('accepts custom form id and can be submitted from outside', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e) => e.preventDefault());

    render(
      <Wrapper>
        <ProductForm id="custom-form-id" onSubmit={onSubmit} />
        <button
          type="submit"
          form="custom-form-id"
          data-testid="product-form-outside-submit-button"
        >
          Submit Outside
        </button>
      </Wrapper>,
    );

    const form = screen.getByTestId('product-form');
    expect(form).toHaveAttribute('id', 'custom-form-id');

    const nameInput = screen.getByTestId('product-form-name-input');
    const submitButton = screen.getByTestId('product-form-outside-submit-button');

    await user.type(nameInput, 'Test Product');
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalled();
  });
});
