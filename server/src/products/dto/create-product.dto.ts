import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  sku: z.string().min(1).max(50),
  category: z.string().min(1).max(100),
  price: z.number().min(0),
  quantity: z.number().int().min(0).default(0),
  minStock: z.number().int().min(0).default(10),
  storeId: z.string().uuid(),
});

export class CreateProductDto extends createZodDto(createProductSchema) {}
