import { apiClient } from './client';

export interface StoreInventoryValue {
  storeId: string;
  storeName: string;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
}

export interface InventoryValueResponse {
  stores: StoreInventoryValue[];
  grandTotal: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  deficit: number;
  storeId: string;
  storeName: string;
}

export interface CategorySummary {
  category: string;
  productCount: number;
  totalQuantity: number;
  totalValue: number;
  averagePrice: number;
}

export const analyticsApi = {
  getInventoryValue: async (): Promise<InventoryValueResponse> => {
    const response = await apiClient.get<InventoryValueResponse>('/analytics/inventory-value');
    return response.data;
  },

  getLowStockProducts: async (): Promise<LowStockProduct[]> => {
    const response = await apiClient.get<LowStockProduct[]>('/analytics/low-stock');
    return response.data;
  },

  getCategorySummary: async (): Promise<CategorySummary[]> => {
    const response = await apiClient.get<CategorySummary[]>('/analytics/category-summary');
    return response.data;
  },
};
