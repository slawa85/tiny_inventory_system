import type { Store } from './store.types';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  minStock: number;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  storeId: string;
  store?: Store;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  sku: string;
  category: string;
  price: number;
  quantity?: number;
  minStock?: number;
  storeId: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  sku?: string;
  category?: string;
  price?: number;
  minStock?: number;
  isActive?: boolean;
  version: number;
}

export interface AdjustQuantityDto {
  adjustment: number;
  reason: 'sale' | 'return' | 'restock' | 'damaged' | 'correction' | 'other';
  note?: string;
}

export interface ProductQueryParams {
  storeId?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
