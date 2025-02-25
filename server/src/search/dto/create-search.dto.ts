import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define the search request schema
const SearchRequestSchema = z.object({
  query: z.string().min(1).describe('The search query string'),
  max_results: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .default(5)
    .describe('Maximum number of results to return'),
  should_backfill: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to backfill results with Tavily search'),
  skip_transform: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to skip query transformation'),
});

// Create the DTO class
export class CreateSearchDto extends createZodDto(SearchRequestSchema) {}
