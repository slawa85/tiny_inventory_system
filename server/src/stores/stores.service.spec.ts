import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StoresService } from './stores.service';
import { PrismaService } from '../prisma/prisma.service';

const mockStore = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Store',
  address: '123 Test St',
  city: 'Test City',
  state: 'TS',
  zipCode: '12345',
  phone: '555-1234',
  email: 'test@store.com',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { products: 5 },
};

const mockPrismaService = {
  store: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('StoresService', () => {
  let service: StoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all stores with product count', async () => {
      const stores = [mockStore, { ...mockStore, id: 'another-id', name: 'Another Store' }];
      mockPrismaService.store.findMany.mockResolvedValue(stores);

      const result = await service.findAll();

      expect(result).toEqual(stores);
      expect(mockPrismaService.store.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { products: true } } },
      });
    });
  });

  describe('findOne', () => {
    it('should return a store by id', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);

      const result = await service.findOne(mockStore.id);

      expect(result).toEqual(mockStore);
      expect(mockPrismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: mockStore.id },
        include: { _count: { select: { products: true } } },
      });
    });

    it('should throw NotFoundException if store not found', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new store', async () => {
      const createDto = {
        name: 'New Store',
        address: '456 New St',
        city: 'New City',
        state: 'NC',
        zipCode: '67890',
      };
      mockPrismaService.store.create.mockResolvedValue({ ...mockStore, ...createDto });

      const result = await service.create(createDto);

      expect(result.name).toBe(createDto.name);
      expect(mockPrismaService.store.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('update', () => {
    it('should update an existing store', async () => {
      const updateDto = { name: 'Updated Store' };
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.store.update.mockResolvedValue({ ...mockStore, ...updateDto });

      const result = await service.update(mockStore.id, updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(mockPrismaService.store.update).toHaveBeenCalledWith({
        where: { id: mockStore.id },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if store not found', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent-id', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a store', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.store.delete.mockResolvedValue(mockStore);

      const result = await service.remove(mockStore.id);

      expect(result).toEqual(mockStore);
      expect(mockPrismaService.store.delete).toHaveBeenCalledWith({
        where: { id: mockStore.id },
      });
    });

    it('should throw NotFoundException if store not found', async () => {
      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
