import { Refresh } from '@mui/icons-material';
import { Box, Alert, Button, Stack } from '@mui/material';
import { DataGrid, GridOverlay } from '@mui/x-data-grid';
import type { GridColDef, GridRowParams, GridActionsCellItemProps } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from '@/hooks/useTranslation';

import { useStoreList } from '../hooks/useStores';
import type { Store, StoreListQuery } from '../types';

interface StoresGridProps {
  query: StoreListQuery;
  onPaginationChange: (page: number, pageSize: number) => void;
  getActions?: (
    params: GridRowParams<{ id: string }>,
  ) => React.ReactElement<GridActionsCellItemProps>[];
}

export function StoresGrid({ query, getActions, onPaginationChange }: StoresGridProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: storesResponse, isLoading, error, refetch } = useStoreList(query);
  const stores = storesResponse?.items || [];
  const rowCount = storesResponse?.total || 0;

  const columns: GridColDef<Store>[] = [
    {
      field: 'name',
      headerName: t('stores.storeName'),
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'address',
      headerName: t('stores.address'),
      flex: 1,
      minWidth: 200,
      valueGetter: (value) => value || '—',
    },
    {
      field: 'createdAt',
      headerName: t('stores.created'),
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
              <span data-testid="stores-grid-actions-header">{t('common.actions')}</span>
            ),
            width: 120,
            getActions: (params: GridRowParams<{ id: string }>) => getActions(params),
          },
        ] satisfies GridColDef<Store>[])
      : []),
  ];

  return (
    <Box sx={{ height: 640, width: '100%' }}>
      <DataGrid
        getRowId={(row) => row.id}
        rows={stores}
        columns={columns}
        loading={isLoading}
        onPaginationModelChange={(model) => onPaginationChange(model.page, model.pageSize)}
        rowCount={rowCount}
        paginationMode="server"
        disableRowSelectionOnClick
        data-testid="stores-grid"
        slotProps={{
          loadingOverlay: {
            variant: 'skeleton',
            noRowsVariant: 'skeleton',
          },
        }}
        onRowClick={(params) => navigate(`/stores/${params.row.id}`)}
        slots={{
          noRowsOverlay: () =>
            error ? (
              <GridOverlay>
                <Stack spacing={2}>
                  <Alert severity="error">{t('stores.failedToLoadStores')}</Alert>

                  <Button
                    color="inherit"
                    size="small"
                    startIcon={<Refresh />}
                    onClick={() => refetch()}
                    data-testid="stores-grid-retry-button"
                  >
                    {t('common.retry')}
                  </Button>
                </Stack>
              </GridOverlay>
            ) : (
              <GridOverlay>
                <Stack spacing={1} justifyContent="center">
                  <Alert severity="info">{t('stores.noStoresFound')}</Alert>
                </Stack>
              </GridOverlay>
            ),
        }}
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            cursor: 'pointer',
          },
        }}
      />
    </Box>
  );
}
