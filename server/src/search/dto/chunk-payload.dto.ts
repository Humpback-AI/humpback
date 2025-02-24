import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ChunkPayloadSchema = z.object({
  source_url: z.string(),
  title: z.string().min(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
  content: z.string().min(1),
});

export class ChunkPayloadDto extends createZodDto(ChunkPayloadSchema) {}
