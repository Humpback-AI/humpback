import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define the sync request schema
const ContentSyncSchema = z.object({
  chunk_ids: z
    .array(z.string().uuid())
    .describe('The ids of the chunks to sync'),
});

// Create the DTO class
export class ContentSyncDto extends createZodDto(ContentSyncSchema) {}
