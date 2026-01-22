import { Card, CardContent, Typography, Stack, TextField, Button, MenuItem } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

import { useTranslation } from '@/hooks/useTranslation';

import { useCategories } from '../hooks';

type Filter = {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
};

type FormValues = {
  search: string;
  category: string;
  minPrice: string | number;
  maxPrice: string | number;
};

interface ProductFiltersProps {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
}

export function ProductFilters({ filter, onFilterChange }: ProductFiltersProps) {
  const { t } = useTranslation();
  const categories = useCategories();

  const { handleSubmit, control } = useForm<FormValues>({
    values: {
      search: filter.search || '',
      category: filter.category || 'all',
      minPrice: filter.minPrice || '',
      maxPrice: filter.maxPrice || '',
    },
  });

  const onSubmit = (data: FormValues) => {
    onFilterChange({
      search: data.search || undefined,
      category: data.category === 'all' ? undefined : data.category,
      minPrice: data.minPrice ? Number(data.minPrice) : undefined,
      maxPrice: data.maxPrice ? Number(data.maxPrice) : undefined,
    });
  };

  const onReset = () => {
    onFilterChange({
      search: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">{t('products.filterProducts')}</Typography>

          <form
            id="product-filters-form"
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
                    placeholder={t('products.productNamePlaceholder')}
                    error={!!error}
                    helperText={error?.message}
                    sx={{ width: '100%' }}
                    slotProps={{
                      input: {
                        inputProps: {
                          'data-testid': 'product-filters-search-input',
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
                    error={!!error}
                    helperText={error?.message}
                    sx={{ minWidth: 160 }}
                    data-testid="product-filters-category-select"
                  >
                    <MenuItem value="all">{t('products.allCategories')}</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="minPrice"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('products.minPrice')}
                    type="number"
                    error={!!error}
                    helperText={error?.message}
                    sx={{ minWidth: 128, maxWidth: 128 }}
                    slotProps={{
                      input: {
                        inputProps: {
                          'data-testid': 'product-filters-min-price-input',
                          min: 0,
                          step: 0.01,
                        },
                      },
                    }}
                  />
                )}
              />
              <Controller
                name="maxPrice"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('products.maxPrice')}
                    type="number"
                    sx={{ minWidth: 128, maxWidth: 128 }}
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{
                      input: {
                        inputProps: {
                          'data-testid': 'product-filters-max-price-input',
                          min: 0,
                          step: 0.01,
                        },
                      },
                    }}
                  />
                )}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  form="product-filters-form"
                  variant="outlined"
                  type="reset"
                  data-testid="product-filters-clear-button"
                >
                  {t('common.clear')}
                </Button>
                <Button
                  form="product-filters-form"
                  variant="contained"
                  type="submit"
                  data-testid="product-filters-apply-button"
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
