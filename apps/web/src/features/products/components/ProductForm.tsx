import { TextField, Stack, MenuItem } from '@mui/material';
import type { FormHTMLAttributes } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import { useTranslation } from '@/hooks/useTranslation';

import { useCategories } from '../hooks';
import type { ProductFormSchema } from '../validation.schemas';

export type ProductFormValues = ProductFormSchema;

type ProductFormProps = FormHTMLAttributes<HTMLFormElement> & {
  id?: string;
  isLoading?: boolean;
};

export function ProductForm({ isLoading, ...rest }: ProductFormProps) {
  const categories = useCategories();
  const { control } = useFormContext<ProductFormValues>();
  const { t } = useTranslation();

  return (
    <form {...rest} data-testid="product-form">
      <Stack spacing={2}>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              autoFocus
              label={t('products.productName')}
              fullWidth
              disabled={isLoading}
              error={!!error}
              helperText={error?.message}
              slotProps={{
                input: {
                  inputProps: {
                    'data-testid': 'product-form-name-input',
                  },
                },
              }}
            />
          )}
        />

        <Controller
          name="category"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              select
              label={t('products.category')}
              fullWidth
              disabled={isLoading}
              error={!!error}
              helperText={error?.message}
              data-testid="product-form-category-select"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="price"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              type="number"
              label={t('products.price')}
              fullWidth
              disabled={isLoading}
              error={!!error}
              helperText={error?.message}
              slotProps={{
                input: {
                  inputProps: {
                    'data-testid': 'product-form-price-input',
                    min: 0,
                    step: 0.01,
                  },
                },
              }}
            />
          )}
        />
        <Controller
          name="stockQuantity"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              type="number"
              label={t('products.stockQuantity')}
              fullWidth
              disabled={isLoading}
              error={!!error}
              helperText={error?.message}
              slotProps={{
                input: {
                  inputProps: {
                    'data-testid': 'product-form-stock-quantity-input',
                    min: 0,
                    step: 1,
                  },
                },
              }}
            />
          )}
        />
      </Stack>
    </form>
  );
}
