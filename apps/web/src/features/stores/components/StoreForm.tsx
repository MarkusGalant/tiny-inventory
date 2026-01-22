import { TextField, Stack } from '@mui/material';
import type { FormHTMLAttributes } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import { useTranslation } from '@/hooks/useTranslation';

import type { StoreFormSchema } from '../validation.schema';

export type StoreFormValues = StoreFormSchema;

type StoreFormProps = FormHTMLAttributes<HTMLFormElement> & {
  id?: string;
  isLoading?: boolean;
};

export function StoreForm({ isLoading, ...rest }: StoreFormProps) {
  const { control } = useFormContext<StoreFormValues>();
  const { t } = useTranslation();

  return (
    <form {...rest} data-testid="store-form">
      <Stack spacing={2}>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              autoFocus
              label={t('stores.storeName')}
              disabled={isLoading}
              value={field.value || ''}
              error={!!error}
              helperText={error?.message}
              slotProps={{
                input: {
                  inputProps: {
                    'data-testid': 'store-form-name-input',
                  },
                },
              }}
            />
          )}
        />

        <Controller
          name="address"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label={t('stores.address')}
              disabled={isLoading}
              value={field.value || ''}
              error={!!error}
              helperText={error?.message}
              slotProps={{
                input: {
                  inputProps: {
                    'data-testid': 'store-form-address-input',
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
