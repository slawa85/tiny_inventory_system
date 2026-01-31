import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

const mockStore = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Store',
};

const mockProduct = {
  id: '223e4567-e89b-12d3-a456-426614174001',
  name: 'Test Product',
  description: 'A test product',
  sku: 'TEST-001',
  category: 'Electronics',
  price: 99.99,
  quantity: 50,
  minStock: 10,
  isActive: true,
  storeId: mockStore.id,
  store: mockStore,
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 0,
};

const defaultQueryParams = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt' as const,
  sortOrder: 'desc' as const,
};

const mockPrismaService = {
  product: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  store: {
    findUnique: vi.fn(),
  },
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const products = [mockProduct];
      mockPrismaService.product.findMany.mockResolvedValue(products);
      mockPrismaService.product.count.mockResolvedValue(1);

      const result = await service.findAll(defaultQueryParams);

      expect(result.data).toEqual(products);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter by storeId', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
      mockPrismaService.product.count.mockResolvedValue(1);

      await service.findAll({ ...defaultQueryParams, storeId: mockStore.id });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ storeId: mockStore.id }),
        }),
      );
    });

    it('should filter by category', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
      mockPrismaService.product.count.mockResolvedValue(1);

      await service.findAll({ ...defaultQueryParams, category: 'Electronics' });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'Electronics' }),
        }),
      );
    });

    it('should filter by price range', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
      mockPrismaService.product.count.mockResolvedValue(1);

      await service.findAll({ ...defaultQueryParams, minPrice: 50, maxPrice: 150 });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { gte: 50, lte: 150 },
          }),
        }),
      );
    });

    it('should filter inStock products', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
      mockPrismaService.product.count.mockResolvedValue(1);

      await service.findAll({ ...defaultQueryParams, inStock: true });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            quantity: { gt: 0 },
          }),
        }),
      );
    });

    it('should search by name, description, or sku', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
      mockPrismaService.product.count.mockResolvedValue(1);

      await service.findAll({ ...defaultQueryParams, search: 'test' });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'test', mode: 'insensitive' } },
              { description: { contains: 'test', mode: 'insensitive' } },
              { sku: { contains: 'test', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });

    it('should handle pagination correctly', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
      mockPrismaService.product.count.mockResolvedValue(50);

      const result = await service.findAll({ ...defaultQueryParams, page: 2, limit: 10 });

      expect(result.meta.page).toBe(2);
      expect(result.meta.totalPages).toBe(5);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(true);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne(mockProduct.id);

      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      name: 'New Product',
      sku: 'NEW-001',
      category: 'Electronics',
      price: 149.99,
      quantity: 0,
      minStock: 10,
      storeId: mockStore.id,
    };

    it('should create a new product', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue({ ...mockProduct, ...createDto });

      const result = await service.create(createDto);

      expect(result.name).toBe(createDto.name);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: createDto,
        include: { store: true },
      });
    });

    it('should throw NotFoundException if store not found', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if SKU already exists', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const updateDto = { name: 'Updated Product', price: 199.99, version: 0 };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({ ...mockProduct, ...updateDto });

      const result = await service.update(mockProduct.id, updateDto);

      expect(result!.name).toBe(updateDto.name);
      expect(result!.price).toBe(updateDto.price);
    });

    it('should throw ConflictException if updating to existing SKU', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.findFirst.mockResolvedValue({ ...mockProduct, id: 'other-id' });

      await expect(
        service.update(mockProduct.id, { sku: 'EXISTING-SKU', version: 0 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      const result = await service.remove(mockProduct.id);

      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
