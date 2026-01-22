import { Card, CardContent, Typography, Stack, TextField, Button } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

import { useTranslation } from '@/hooks/useTranslation';

type Filter = {
  search?: string;
};

interface StoreFiltersProps {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
}

export function StoreFilters({ filter, onFilterChange }: StoreFiltersProps) {
  const { t } = useTranslation();
  const { handleSubmit, reset, control } = useForm<Filter>({
    values: filter,
  });

  const onSubmit = (data: Filter) => {
    onFilterChange({
      search: data.search?.trim() || undefined,
    });
  };

  const onReset = () => {
    reset({
      search: '',
    });
    onFilterChange({
      search: undefined,
    });
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">{t('stores.filterStores')}</Typography>

          <form
            id="store-filters-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(onSubmit)();
            }}
            onReset={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReset();
            }}
          >
            <Stack direction="row" spacing={2}>
              <Controller
                name="search"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    autoFocus
                    fullWidth
                    label={t('common.search')}
                    placeholder={t('stores.storeNamePlaceholder')}
                    sx={{ width: '100%' }}
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{
                      input: {
                        inputProps: {
                          'data-testid': 'store-filters-search-input',
                        },
                      },
                    }}
                  />
                )}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  form="store-filters-form"
                  variant="outlined"
                  type="reset"
                  data-testid="store-filters-clear-button"
                >
                  {t('common.clear')}
                </Button>
                <Button
                  form="store-filters-form"
                  variant="contained"
                  type="submit"
                  data-testid="store-filters-apply-button"
                >
                  {t('common.apply')}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </CardContent>
    </Card>
  );
}
