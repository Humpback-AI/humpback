import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';

import { QDRANT_CLIENT } from '@/providers/qdrant.provider';
import { OPENAI_CLIENT } from '@/providers/openai.provider';

import { CreateSearchDto } from './dto/create-search.dto';
import { SearchResponseDto } from './dto/search-response.dto';
import { ChunkPayloadSchema } from './dto/chunk-payload.dto';

@Injectable()
export class SearchService {
  constructor(
    @Inject(QDRANT_CLIENT)
    private readonly qdrantClient: QdrantClient,
    @Inject(OPENAI_CLIENT)
    private readonly openai: OpenAI,
    private readonly configService: ConfigService,
  ) {}

  async create(createSearchDto: CreateSearchDto): Promise<SearchResponseDto> {
    const startTime = Date.now();

    // Generate embedding for the search query
    const embeddingResponse = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: createSearchDto.query,
    });

    const queryVector = embeddingResponse.data[0].embedding;

    const results = await this.qdrantClient.search('chunks', {
      vector: queryVector,
      limit: createSearchDto.max_results,
    });

    return {
      query: createSearchDto.query,
      results: results.map((result) => ({
        ...ChunkPayloadSchema.parse(result.payload),
        score: result.score,
      })),
      total_results: results.length,
      time_taken: (Date.now() - startTime) / 1_000, // Convert to seconds
    };
  }
}
