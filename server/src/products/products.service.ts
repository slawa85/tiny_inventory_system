import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { AdjustQuantityDto } from './dto/adjust-quantity.dto';
import { createPaginatedResponse } from '../common/dto/paginated-response.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const {
      storeId,
      category,
      minPrice,
      maxPrice,
      inStock,
      lowStock,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.ProductWhereInput = {};

    if (storeId) {
      where.storeId = storeId;
    }

    if (category) {
      where.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    if (inStock === true) {
      where.quantity = { gt: 0 };
    }

    if (lowStock === true) {
      where.quantity = { lte: this.prisma.$queryRaw`"minStock"` as unknown as number };
      // Use raw condition for comparing columns
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          quantity: {
            lte: 999999, // Placeholder, actual logic below
          },
        },
      ];
      // Override with raw query for column comparison
      delete where.AND;
      where.quantity = undefined;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    // Handle lowStock with raw query since it compares two columns
    let products;
    let total;

    if (lowStock === true) {
      // Build base where without lowStock
      const baseWhere: Prisma.ProductWhereInput = {};
      if (storeId) baseWhere.storeId = storeId;
      if (category) baseWhere.category = category;
      if (minPrice !== undefined || maxPrice !== undefined) {
        baseWhere.price = {};
        if (minPrice !== undefined) baseWhere.price.gte = minPrice;
        if (maxPrice !== undefined) baseWhere.price.lte = maxPrice;
      }
      if (inStock === true) baseWhere.quantity = { gt: 0 };
      if (search) {
        baseWhere.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get all matching products and filter in memory for lowStock
      const allProducts = await this.prisma.product.findMany({
        where: baseWhere,
        include: { store: true },
        orderBy: { [sortBy]: sortOrder },
      });

      const lowStockProducts = allProducts.filter((p) => p.quantity <= p.minStock);
      total = lowStockProducts.length;
      products = lowStockProducts.slice(skip, skip + limit);
    } else {
      [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          include: { store: true },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        this.prisma.product.count({ where }),
      ]);
    }

    return createPaginatedResponse(products, total, page, limit);
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    // Check if store exists
    const store = await this.prisma.store.findUnique({
      where: { id: createProductDto.storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${createProductDto.storeId} not found`);
    }

    // Check for duplicate SKU
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });

    if (existingProduct) {
      throw new ConflictException(`Product with SKU ${createProductDto.sku} already exists`);
    }

    return this.prisma.product.create({
      data: createProductDto,
      include: { store: true },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { version, ...data } = updateProductDto;

    // Check for duplicate SKU if updating
    if (data.sku) {
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          sku: data.sku,
          NOT: { id },
        },
      });

      if (existingProduct) {
        throw new ConflictException(`Product with SKU ${data.sku} already exists`);
      }
    }

    // Optimistic locking: only update if version matches
    const result = await this.prisma.product.updateMany({
      where: {
        id,
        version,
      },
      data: {
        ...data,
        version: { increment: 1 },
      },
    });

    if (result.count === 0) {
      // Check if product exists
      const product = await this.prisma.product.findUnique({ where: { id } });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Product exists but version didn't match
      throw new ConflictException(
        'This product was modified by another user. Please refresh and try again.',
      );
    }

    return this.prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });
  }

  async adjustQuantity(id: string, adjustQuantityDto: AdjustQuantityDto) {
    const { adjustment, reason, note } = adjustQuantityDto;

    // First check if product exists and get current quantity
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check if adjustment would result in negative quantity
    if (product.quantity + adjustment < 0) {
      throw new BadRequestException(
        `Cannot reduce quantity by ${Math.abs(adjustment)}. Current stock is ${product.quantity}.`,
      );
    }

    // Atomic update - no version check needed
    return this.prisma.product.update({
      where: { id },
      data: {
        quantity: { increment: adjustment },
      },
      include: { store: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async getCategories() {
    const categories = await this.prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return categories.map((c) => c.category);
  }
}
