import { apiClient } from './client';
import type { Product, CreateProductDto, UpdateProductDto, ProductQueryParams } from '../types/product.types';
import type { PaginatedResponse } from '../types/api.types';

export const productsApi = {
  getAll: async (params?: ProductQueryParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>('/products', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await apiClient.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/products/categories');
    return response.data;
  },
};
