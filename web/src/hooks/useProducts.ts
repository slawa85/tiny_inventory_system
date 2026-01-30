import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import type {
  CreateProductDto,
  UpdateProductDto,
  AdjustQuantityDto,
  ProductQueryParams,
} from '../types/product.types';

export const productKeys = {
  all: ['products'] as const,
  list: (params: ProductQueryParams) => ['products', 'list', params] as const,
  detail: (id: string) => ['products', id] as const,
  categories: ['products', 'categories'] as const,
};

export function useProducts(params: ProductQueryParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.getAll(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: productsApi.getCategories,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      productsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}

export function useAdjustQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustQuantityDto }) =>
      productsApi.adjustQuantity(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
