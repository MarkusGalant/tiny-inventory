import { Refresh } from '@mui/icons-material';
import { Box, Alert, Button, Stack } from '@mui/material';
import { DataGrid, GridOverlay } from '@mui/x-data-grid';
import type { GridColDef, GridRowParams, GridActionsCellItemProps } from '@mui/x-data-grid';

import { useTranslation } from '@/hooks/useTranslation';

import { useProductList } from '../hooks/useProducts';
import type { Product, ProductListQuery } from '../types';

interface ProductsGridProps {
  query: ProductListQuery;
  onPaginationChange?: (page: number, pageSize: number) => void;
  getActions?: (
    params: GridRowParams<{ id: string }>,
  ) => React.ReactElement<GridActionsCellItemProps>[];
}

export function ProductsGrid({ query, getActions, onPaginationChange }: ProductsGridProps) {
  const { t } = useTranslation();
  const { data: productsResponse, isLoading, error, refetch } = useProductList(query);

  const products = productsResponse?.items || [];
  const rowCount = productsResponse?.total || 0;

  const columns: GridColDef<Product>[] = [
    {
      field: 'name',
      headerName: t('products.productName'),
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'category',
      headerName: t('products.category'),
      width: 150,
    },
    {
      field: 'price',
      headerName: t('products.price'),
      width: 120,
      type: 'number',
      valueFormatter: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      field: 'createdAt',
      headerName: t('products.created'),
      width: 150,
      type: 'date',
      valueGetter: (value) => value && new Date(value as string),
    },
    ...(getActions
      ? ([
          {
            field: 'actions',
            type: 'actions',
            headerName: t('common.actions'),
            renderHeader: () => (
              <span data-testid="products-grid-actions-header">{t('common.actions')}</span>
            ),
            width: 120,
            getActions: (params: GridRowParams<{ id: string }>) => getActions(params),
          },
        ] satisfies GridColDef<Product>[])
      : []),
  ];

  return (
    <Box sx={{ height: 640, width: '100%' }}>
      <DataGrid
        getRowId={(row) => row.id}
        rows={products}
        columns={columns}
        loading={isLoading}
        onPaginationModelChange={(model) => onPaginationChange?.(model.page, model.pageSize)}
        rowCount={rowCount}
        paginationMode="server"
        disableRowSelectionOnClick
        data-testid="products-grid"
        slotProps={{
          loadingOverlay: {
            variant: 'skeleton',
            noRowsVariant: 'skeleton',
          },
        }}
        slots={{
          noRowsOverlay: () =>
            error ? (
              <GridOverlay>
                <Stack spacing={1} justifyContent="center" alignItems="center" height="100%">
                  <Alert severity="error" variant="outlined">
                    {t('products.failedToLoadProducts')}
                  </Alert>
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={<Refresh />}
                    onClick={() => refetch()}
                    data-testid="products-grid-retry-button"
                  >
                    {t('common.retry')}
                  </Button>
                </Stack>
              </GridOverlay>
            ) : (
              <GridOverlay>
                <Stack spacing={1} justifyContent="center">
                  <Alert severity="info">{t('products.noProductsFound')}</Alert>
                </Stack>
              </GridOverlay>
            ),
        }}
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
        }}
      />
    </Box>
  );
}
