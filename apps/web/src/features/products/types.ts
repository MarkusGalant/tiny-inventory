// Product Types
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProduct {
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
}

export interface UpdateProduct {
  name?: string;
  category?: string;
  price?: number;
  stockQuantity?: number;
}

export interface ProductListQuery {
  search?: string;
  category?: string;
  storeIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  skip?: number;
  take?: number;
}

export interface ProductList {
  items: Product[];
  total: number;
}
