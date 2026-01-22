import { useQuery } from '@tanstack/react-query';

import { storeApi } from '../api';
import type { StoreListQuery } from '../types';

export const useStores = () => {
  return useQuery({
    queryKey: ['stores'],
    queryFn: () => storeApi.getAll(),
  });
};

export const useStoreList = (query: StoreListQuery) => {
  return useQuery({
    queryKey: ['stores', query],
    queryFn: () => storeApi.list(query),
  });
};

export const useStore = (id: string) => {
  return useQuery({
    queryKey: ['stores', id],
    queryFn: () => storeApi.getById(id!),
  });
};

export const useStoreStatistics = (storeId: string) => {
  return useQuery({
    queryKey: ['stores', storeId, 'statistics'],
    queryFn: () => storeApi.statistics(storeId),
    enabled: !!storeId,
  });
};
