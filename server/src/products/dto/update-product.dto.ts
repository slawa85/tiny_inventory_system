import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  sku: z.string().min(1).max(50).optional(),
  category: z.string().min(1).max(100).optional(),
  price: z.number().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  version: z.number().int().min(0).describe('Required for optimistic locking'),
});

export class UpdateProductDto extends createZodDto(updateProductSchema) {}
