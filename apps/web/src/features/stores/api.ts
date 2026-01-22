import { apiClient } from '@/config/api-client';

import type {
  Store,
  StoreList,
  StoreListQuery,
  CreateStore,
  UpdateStore,
  AddProduct,
  RemoveProduct,
  StoreStatistics,
} from './types';

export const storeApi = {
  list: async (query?: StoreListQuery): Promise<StoreList> => {
    const response = await apiClient.get<StoreList>('/stores', { params: query });
    return response.data;
  },

  findOne: async (id: string): Promise<Store> => {
    const response = await apiClient.get<Store>(`/stores/${id}`);
    return response.data;
  },

  getAll: async (): Promise<Store[]> => {
    const response = await storeApi.list();
    return response.items;
  },

  getById: async (id: string): Promise<Store> => {
    return storeApi.findOne(id);
  },

  create: async (data: CreateStore): Promise<Store> => {
    const response = await apiClient.post<Store>('/stores', data);
    return response.data;
  },

  update: async (id: string, data: UpdateStore): Promise<Store> => {
    const response = await apiClient.patch<Store>(`/stores/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/stores/${id}`);
  },

  addProduct: async (storeId: string, data: AddProduct): Promise<void> => {
    await apiClient.post(`/stores/${storeId}/products`, data);
  },

  removeProduct: async (storeId: string, data: RemoveProduct): Promise<void> => {
    await apiClient.delete(`/stores/${storeId}/products/${data.productId}`);
  },

  statistics: async (storeId: string): Promise<StoreStatistics> => {
    const response = await apiClient.get<StoreStatistics>(`/stores/${storeId}/statistics`);
    return response.data;
  },
};
