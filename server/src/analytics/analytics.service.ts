import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryValueResponse, StoreInventoryValue } from './dto/inventory-value.dto';
import { CategorySummary } from './dto/category-summary.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getInventoryValue(): Promise<InventoryValueResponse> {
    const stores = await this.prisma.store.findMany({
      include: {
        products: {
          select: {
            price: true,
            quantity: true,
          },
        },
      },
    });

    const storeValues: StoreInventoryValue[] = stores.map((store) => {
      const totalProducts = store.products.length;
      const totalQuantity = store.products.reduce((sum, p) => sum + p.quantity, 0);
      const totalValue = store.products.reduce(
        (sum, p) => sum + Number(p.price) * p.quantity,
        0,
      );

      return {
        storeId: store.id,
        storeName: store.name,
        totalProducts,
        totalQuantity,
        totalValue: Math.round(totalValue * 100) / 100,
      };
    });

    const grandTotal = storeValues.reduce((sum, s) => sum + s.totalValue, 0);

    return {
      stores: storeValues,
      grandTotal: Math.round(grandTotal * 100) / 100,
    };
  }

  async getLowStockProducts() {
    const products = await this.prisma.product.findMany({
      include: { store: true },
      orderBy: { quantity: 'asc' },
    });

    // Filter products where quantity <= minStock
    const lowStockProducts = products.filter((p) => p.quantity <= p.minStock);

    return lowStockProducts.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      quantity: p.quantity,
      minStock: p.minStock,
      deficit: p.minStock - p.quantity,
      storeId: p.storeId,
      storeName: p.store.name,
    }));
  }

  async getCategorySummary(): Promise<CategorySummary[]> {
    const products = await this.prisma.product.findMany({
      select: {
        category: true,
        price: true,
        quantity: true,
      },
    });

    const categoryMap = new Map<
      string,
      { count: number; totalQuantity: number; totalValue: number; totalPrice: number }
    >();

    for (const product of products) {
      const existing = categoryMap.get(product.category) || {
        count: 0,
        totalQuantity: 0,
        totalValue: 0,
        totalPrice: 0,
      };

      existing.count += 1;
      existing.totalQuantity += product.quantity;
      existing.totalValue += Number(product.price) * product.quantity;
      existing.totalPrice += Number(product.price);

      categoryMap.set(product.category, existing);
    }

    const summaries: CategorySummary[] = [];
    for (const [category, data] of categoryMap) {
      summaries.push({
        category,
        productCount: data.count,
        totalQuantity: data.totalQuantity,
        totalValue: Math.round(data.totalValue * 100) / 100,
        averagePrice: Math.round((data.totalPrice / data.count) * 100) / 100,
      });
    }

    return summaries.sort((a, b) => a.category.localeCompare(b.category));
  }
}
