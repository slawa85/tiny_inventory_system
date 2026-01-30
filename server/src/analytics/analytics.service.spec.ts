import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

const mockStore1 = {
  id: 'store-1',
  name: 'Store One',
  products: [
    { price: 100, quantity: 10 },
    { price: 50, quantity: 20 },
  ],
};

const mockStore2 = {
  id: 'store-2',
  name: 'Store Two',
  products: [
    { price: 200, quantity: 5 },
  ],
};

const mockProducts = [
  {
    id: 'product-1',
    name: 'Product 1',
    sku: 'SKU-001',
    category: 'Electronics',
    price: 100,
    quantity: 5,
    minStock: 10,
    storeId: 'store-1',
    store: { name: 'Store One' },
  },
  {
    id: 'product-2',
    name: 'Product 2',
    sku: 'SKU-002',
    category: 'Electronics',
    price: 150,
    quantity: 8,
    minStock: 5,
    storeId: 'store-1',
    store: { name: 'Store One' },
  },
  {
    id: 'product-3',
    name: 'Product 3',
    sku: 'SKU-003',
    category: 'Clothing',
    price: 50,
    quantity: 3,
    minStock: 10,
    storeId: 'store-2',
    store: { name: 'Store Two' },
  },
];

const mockPrismaService = {
  store: {
    findMany: vi.fn(),
  },
  product: {
    findMany: vi.fn(),
  },
};

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    vi.clearAllMocks();
  });

  describe('getInventoryValue', () => {
    it('should calculate inventory value per store', async () => {
      mockPrismaService.store.findMany.mockResolvedValue([mockStore1, mockStore2]);

      const result = await service.getInventoryValue();

      expect(result.stores).toHaveLength(2);
      expect(result.stores[0].storeId).toBe('store-1');
      expect(result.stores[0].storeName).toBe('Store One');
      expect(result.stores[0].totalProducts).toBe(2);
      expect(result.stores[0].totalQuantity).toBe(30);
      expect(result.stores[0].totalValue).toBe(2000); // 100*10 + 50*20

      expect(result.stores[1].storeId).toBe('store-2');
      expect(result.stores[1].totalValue).toBe(1000); // 200*5
    });

    it('should calculate grand total correctly', async () => {
      mockPrismaService.store.findMany.mockResolvedValue([mockStore1, mockStore2]);

      const result = await service.getInventoryValue();

      expect(result.grandTotal).toBe(3000); // 2000 + 1000
    });

    it('should handle empty stores', async () => {
      mockPrismaService.store.findMany.mockResolvedValue([]);

      const result = await service.getInventoryValue();

      expect(result.stores).toHaveLength(0);
      expect(result.grandTotal).toBe(0);
    });
  });

  describe('getLowStockProducts', () => {
    it('should return products below minStock', async () => {
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.getLowStockProducts();

      // Products 1 and 3 are below minStock
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('product-1');
      expect(result[0].deficit).toBe(5); // minStock(10) - quantity(5)
      expect(result[1].id).toBe('product-3');
      expect(result[1].deficit).toBe(7); // minStock(10) - quantity(3)
    });

    it('should not include products above minStock', async () => {
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.getLowStockProducts();

      const product2 = result.find((p) => p.id === 'product-2');
      expect(product2).toBeUndefined(); // quantity(8) > minStock(5)
    });

    it('should include store information', async () => {
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.getLowStockProducts();

      expect(result[0].storeName).toBe('Store One');
      expect(result[0].storeId).toBe('store-1');
    });
  });

  describe('getCategorySummary', () => {
    it('should aggregate products by category', async () => {
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.getCategorySummary();

      expect(result).toHaveLength(2);

      const electronics = result.find((c) => c.category === 'Electronics');
      expect(electronics).toBeDefined();
      expect(electronics!.productCount).toBe(2);
      expect(electronics!.totalQuantity).toBe(13); // 5 + 8
      expect(electronics!.totalValue).toBe(1700); // 100*5 + 150*8
      expect(electronics!.averagePrice).toBe(125); // (100+150)/2

      const clothing = result.find((c) => c.category === 'Clothing');
      expect(clothing).toBeDefined();
      expect(clothing!.productCount).toBe(1);
      expect(clothing!.totalQuantity).toBe(3);
      expect(clothing!.totalValue).toBe(150); // 50*3
      expect(clothing!.averagePrice).toBe(50);
    });

    it('should sort categories alphabetically', async () => {
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.getCategorySummary();

      expect(result[0].category).toBe('Clothing');
      expect(result[1].category).toBe('Electronics');
    });

    it('should handle empty product list', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      const result = await service.getCategorySummary();

      expect(result).toHaveLength(0);
    });
  });
});
