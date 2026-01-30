import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const adjustQuantitySchema = z.object({
  adjustment: z.number().int().describe('Positive to add stock, negative to remove'),
  reason: z.enum(['sale', 'return', 'restock', 'damaged', 'correction', 'other']),
  note: z.string().max(500).optional(),
});

export class AdjustQuantityDto extends createZodDto(adjustQuantitySchema) {}
