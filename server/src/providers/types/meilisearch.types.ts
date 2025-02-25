import { z } from 'zod';

import { ChunkPayloadSchema } from '@/providers/schemas/qdrant.schema';

export type ChunksIndex = z.infer<typeof ChunkPayloadSchema>;
