import { Delete, Edit, FilterList } from '@mui/icons-material';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import type { GridRowParams } from '@mui/x-data-grid';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { useState } from 'react';

import { useModal } from '@/features/common/hooks/useModal';
import {
  CreateStoreDialog,
  EditStoreDialog,
  DeleteStoreDialog,
  StoreFilters,
  StoresGrid,
} from '@/features/stores';
import type { StoreListQuery } from '@/features/stores/types';
import { useTranslation } from '@/hooks/useTranslation';

export function StoresPage() {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const [params, setParams] = useState<StoreListQuery>({
    search: undefined,
    sortBy: undefined,
    sortOrder: undefined,
    skip: 0,
    take: 10,
  });
  const editModal = useModal<{ id: string }>();
  const deleteModal = useModal<{ id: string }>();
  const createModal = useModal<{ id: string }>();

  const getActions = (params: GridRowParams<{ id: string }>) => [
    <GridActionsCellItem
      key="edit"
      icon={<Edit />}
      aria-label={t('common.edit')}
      label={t('common.edit')}
      onClick={() => editModal.open({ id: params.id as string })}
      showInMenu={false}
    />,
    <GridActionsCellItem
      key="delete"
      aria-label={t('common.delete')}
      icon={<Delete />}
      label={t('common.delete')}
      onClick={() => deleteModal.open({ id: params.id as string })}
      showInMenu={false}
    />,
  ];

  return (
    <Stack spacing={4}>
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Typography variant="h1" data-testid="stores-page-title">
          {t('stores.title')}
        </Typography>

        <Stack direction="row" spacing={2}>
          <IconButton
            color="primary"
            onClick={() => setFilterOpen((value) => !value)}
            data-testid="stores-page-filter-button"
          >
            <FilterList />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            onClick={() => createModal.open()}
            data-testid="stores-page-add-button"
          >
            {t('stores.addStore')}
          </Button>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        {filterOpen && (
          <StoreFilters
            filter={{
              search: params.search,
            }}
            onFilterChange={(val) => setParams((prev) => ({ ...prev, ...val }))}
          />
        )}

        <StoresGrid
          query={params}
          getActions={getActions}
          onPaginationChange={(page, pageSize) =>
            setParams((prev) => ({ ...prev, skip: page * pageSize, take: pageSize }))
          }
        />
      </Stack>

      {createModal.isOpen && <CreateStoreDialog onClose={createModal.close} />}
      {editModal.isOpen && editModal.data && (
        <EditStoreDialog storeId={editModal.data.id} onClose={editModal.close} />
      )}
      {deleteModal.isOpen && deleteModal.data && (
        <DeleteStoreDialog storeId={deleteModal.data.id} onClose={deleteModal.close} />
      )}
    </Stack>
  );
}
