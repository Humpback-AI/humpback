import { z } from 'zod';

export const ChunkPayloadSchema = z.object({
  id: z.string().uuid(),
  source_url: z.string(),
  title: z.string().min(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
  content: z.string().min(1),
  user_id: z.string().uuid(),
});
