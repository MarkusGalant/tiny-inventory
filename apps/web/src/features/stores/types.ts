// Store Types
export interface Store {
  id: string;
  name: string;
  address?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateStore {
  name: string;
  address?: string | null;
}

export interface UpdateStore {
  name?: string;
  address?: string | null;
}

export interface StoreListQuery {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  skip?: number;
  take?: number;
  page?: number;
  limit?: number;
}

export interface StoreStatistics {
  totalInventoryValue: number;
  totalProductCount: number;
  totalStockQuantity: number;
  averageProductPrice: number;
}

export interface StoreList {
  items: Store[];
  total: number;
}

export interface AddProduct {
  productId: string;
}

export interface RemoveProduct {
  productId: string;
}
