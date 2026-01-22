import { apiClient } from '@/config/api-client';

import type { Product, ProductList, ProductListQuery, CreateProduct, UpdateProduct } from './types';

export const productApi = {
  list: async (query?: ProductListQuery): Promise<ProductList> => {
    const response = await apiClient.get<ProductList>('/products', { params: query });
    return response.data;
  },

  findOne: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  create: async (data: CreateProduct): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProduct): Promise<Product> => {
    const response = await apiClient.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
