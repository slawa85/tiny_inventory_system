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
