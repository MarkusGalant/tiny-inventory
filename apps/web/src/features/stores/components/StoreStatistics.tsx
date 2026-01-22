import { Inventory2, ShoppingCart, AttachMoney, TrendingUp } from '@mui/icons-material';
import { Box, Card, CardContent, CircularProgress, Alert, Stack } from '@mui/material';

import { StatisticDetail } from '@/features/common/components/StatisticDetail';
import { useTranslation } from '@/hooks/useTranslation';
import { formatCurrency, formatNumber } from '@/utils';

import { useStoreStatistics } from '../hooks/useStores';

interface StoreStatisticsProps {
  storeId: string;
}

export function StoreStatistics({ storeId }: StoreStatisticsProps) {
  const { t } = useTranslation();
  const { data: statistics, isLoading, error } = useStoreStatistics(storeId);

  return (
    <Card>
      <CardContent>
        {error && <Alert severity="error">{t('storeDetail.failedToLoadStatistics')}</Alert>}
        {isLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        )}
        {!isLoading && !error && statistics && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <StatisticDetail
              icon={<ShoppingCart />}
              label={t('storeDetail.totalProductCount')}
              value={formatNumber(statistics.totalProductCount)}
              valueTestId="store-statistics-total-product-count-value"
            />
            <StatisticDetail
              icon={<AttachMoney />}
              label={t('storeDetail.totalStockQuantity')}
              value={formatNumber(statistics.totalStockQuantity)}
              valueTestId="store-statistics-total-stock-quantity-value"
            />
            <StatisticDetail
              icon={<Inventory2 />}
              label={t('storeDetail.totalInventoryValue')}
              value={formatCurrency(statistics.totalInventoryValue)}
              valueTestId="store-statistics-total-inventory-value"
            />
            <StatisticDetail
              icon={<TrendingUp />}
              label={t('storeDetail.averageProductPrice')}
              value={formatCurrency(statistics.averageProductPrice)}
              valueTestId="store-statistics-average-product-price-value"
            />
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
