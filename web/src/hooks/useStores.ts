import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storesApi } from '../api/stores.api';
import type { CreateStoreDto, UpdateStoreDto } from '../types/store.types';

export const storeKeys = {
  all: ['stores'] as const,
  detail: (id: string) => ['stores', id] as const,
};

export function useStores() {
  return useQuery({
    queryKey: storeKeys.all,
    queryFn: storesApi.getAll,
  });
}

export function useStore(id: string) {
  return useQuery({
    queryKey: storeKeys.detail(id),
    queryFn: () => storesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStoreDto) => storesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStoreDto }) =>
      storesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(id) });
    },
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => storesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
    },
  });
}
