import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { paginationQuerySchema } from '../../common/dto/pagination-query.dto';

export const productQuerySchema = paginationQuerySchema.extend({
  storeId: z.string().uuid().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.coerce.boolean().optional(),
  lowStock: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(['name', 'price', 'quantity', 'createdAt', 'category', 'sku'])
    .default('createdAt'),
});

export class ProductQueryDto extends createZodDto(productQuerySchema) {}
