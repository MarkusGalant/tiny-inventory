import { ArrowBack } from '@mui/icons-material';
import { Button, Stack, Typography, Box, Alert, CircularProgress } from '@mui/material';
import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { ProductsGrid } from '@/features/products';
import { useStore, StoreStatistics } from '@/features/stores';
import { useTranslation } from '@/hooks/useTranslation';

export function StoreDetailPage() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const { data: store, isLoading, error } = useStore(storeId!);
  const { t } = useTranslation();

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return <Alert severity="error">{t('stores.failedToLoadStoreDetails')}</Alert>;
    }

    return (
      store && (
        <Stack spacing={4}>
          <Stack spacing={2}>
            <Typography variant="h1" data-testid="store-detail-name">
              {store.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" data-testid="store-detail-address">
              {store.address}
            </Typography>
          </Stack>
          <StoreStatistics storeId={store.id} />
          <Stack spacing={2}>
            <Typography variant="h2">{t('storeDetail.products')}</Typography>
            <ProductsGrid
              query={{
                storeIds: [store.id],
              }}
              getActions={() => []}
            />
          </Stack>
        </Stack>
      )
    );
  }, [store, isLoading, error, t]);

  return (
    <Stack spacing={4}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/stores')}
          data-testid="store-detail-back-button"
        >
          {t('stores.backToStores')}
        </Button>
      </Stack>

      {content}
    </Stack>
  );
}
