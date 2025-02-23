import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const SearchResultSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  content: z.string(),
  score: z.number().min(0).max(1),
  raw_content: z.string().optional(),
  images: z.array(z.string().url()).optional(),
});

const SearchResponseSchema = z.object({
  query: z.string(),
  results: z.array(SearchResultSchema),
  total_results: z.number().int().min(0),
  search_depth: z.enum(['basic', 'advanced']),
  search_id: z.string().uuid(),
  time_taken: z.number().min(0),
});

export class SearchResponseDto extends createZodDto(SearchResponseSchema) {}
