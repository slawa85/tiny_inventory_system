import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createStoreSchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  zipCode: z.string().min(1).max(20),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
});

export class CreateStoreDto extends createZodDto(createStoreSchema) {}
