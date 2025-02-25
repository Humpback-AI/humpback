import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { ChunkPayloadSchema } from '@/providers/schemas/qdrant.schema';

export class ChunkPayloadDto extends createZodDto(ChunkPayloadSchema) {}

export type ChunkPayloadType = z.infer<typeof ChunkPayloadSchema>;
