import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.api';

export const analyticsKeys = {
  inventoryValue: ['analytics', 'inventory-value'] as const,
  lowStock: ['analytics', 'low-stock'] as const,
  categorySummary: ['analytics', 'category-summary'] as const,
};

export function useInventoryValue() {
  return useQuery({
    queryKey: analyticsKeys.inventoryValue,
    queryFn: analyticsApi.getInventoryValue,
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: analyticsKeys.lowStock,
    queryFn: analyticsApi.getLowStockProducts,
  });
}

export function useCategorySummary() {
  return useQuery({
    queryKey: analyticsKeys.categorySummary,
    queryFn: analyticsApi.getCategorySummary,
  });
}
