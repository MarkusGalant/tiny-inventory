import { Delete, Edit, FilterList } from '@mui/icons-material';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import type { GridRowParams } from '@mui/x-data-grid';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { useState } from 'react';

import { useModal } from '@/features/common/hooks/useModal';
import {
  CreateProductDialog,
  EditProductDialog,
  DeleteProductDialog,
  ProductFilters,
  ProductsGrid,
} from '@/features/products';
import type { ProductListQuery } from '@/features/products/types';
import { useTranslation } from '@/hooks/useTranslation';

export function ProductsPage() {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const [params, setParams] = useState<ProductListQuery>({
    search: undefined,
    storeIds: undefined,
    category: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    skip: 0,
    take: 10,
  });
  const createModal = useModal();
  const editModal = useModal<{ id: string }>();
  const deleteModal = useModal<{ id: string }>();

  const getActions = (params: GridRowParams<{ id: string }>) => [
    <GridActionsCellItem
      key="edit"
      icon={<Edit />}
      label={t('common.edit')}
      onClick={() => editModal.open({ id: params.id as string })}
      showInMenu={false}
    />,
    <GridActionsCellItem
      key="delete"
      icon={<Delete />}
      label={t('common.delete')}
      onClick={() => deleteModal.open({ id: params.id as string })}
      showInMenu={false}
    />,
  ];

  return (
    <Stack spacing={4}>
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Typography variant="h1" data-testid="products-page-title">
          {t('products.title')}
        </Typography>

        <Stack direction="row" spacing={2}>
          <IconButton
            color="primary"
            onClick={() => setFilterOpen((value) => !value)}
            data-testid="products-page-filter-button"
          >
            <FilterList />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            onClick={() => createModal.open()}
            data-testid="products-page-add-button"
          >
            {t('products.addProduct')}
          </Button>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        {filterOpen && (
          <ProductFilters
            filter={{
              search: params.search,
              category: params.category,
              minPrice: params.minPrice,
              maxPrice: params.maxPrice,
            }}
            onFilterChange={(val) => setParams((prev) => ({ ...prev, ...val }))}
          />
        )}

        <ProductsGrid
          query={params}
          getActions={getActions}
          onPaginationChange={(page, pageSize) =>
            setParams((prev) => ({ ...prev, skip: page * pageSize, take: pageSize }))
          }
        />
      </Stack>

      {createModal.isOpen && <CreateProductDialog onClose={createModal.close} />}
      {editModal.isOpen && editModal.data && (
        <EditProductDialog productId={editModal.data.id} onClose={editModal.close} />
      )}
      {deleteModal.isOpen && deleteModal.data && (
        <DeleteProductDialog productId={deleteModal.data.id} onClose={deleteModal.close} />
      )}
    </Stack>
  );
}
