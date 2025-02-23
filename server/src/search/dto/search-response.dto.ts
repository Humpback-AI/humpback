import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const SearchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  content: z.string(),
  score: z.number().min(0).max(1),
});

const SearchResponseSchema = z.object({
  query: z.string(),
  results: z.array(SearchResultSchema),
  total_results: z.number().int().min(0),
  time_taken: z.number().min(0),
});

export class SearchResponseDto extends createZodDto(SearchResponseSchema) {}
