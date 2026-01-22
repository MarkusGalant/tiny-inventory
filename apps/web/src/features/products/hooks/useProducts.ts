import { useQuery } from '@tanstack/react-query';

import { productApi } from '../api';
import type { ProductListQuery } from '../types';

export const useProductList = (query: ProductListQuery) => {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () => productApi.list(query),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productApi.findOne(id!),
  });
};
