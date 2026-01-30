import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateStoreSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  address: z.string().min(1).max(255).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(50).optional(),
  zipCode: z.string().min(1).max(20).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  isActive: z.boolean().optional(),
});

export class UpdateStoreDto extends createZodDto(updateStoreSchema) {}
