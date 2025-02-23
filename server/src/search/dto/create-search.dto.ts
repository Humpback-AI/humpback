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
  search_depth: z
    .enum(['basic', 'advanced'])
    .optional()
    .default('basic')
    .describe('Depth of search to perform'),
  include_raw_content: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to include raw content in results'),
  include_images: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to include images in results'),
});

// Create the DTO class
export class CreateSearchDto extends createZodDto(SearchRequestSchema) {}
