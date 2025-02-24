import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define the sync request schema
const ContentSyncSchema = z.object({
  chunk_id: z
    .number()
    .int()
    .positive()
    .describe('The ID to start syncing from'),
});

// Create the DTO class
export class ContentSyncDto extends createZodDto(ContentSyncSchema) {}
