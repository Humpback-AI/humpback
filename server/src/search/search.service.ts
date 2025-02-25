import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
import { tavily } from '@tavily/core';
import { randomUUID } from 'crypto';

import { QDRANT_CLIENT } from '@/providers/qdrant.provider';
import { OPENAI_CLIENT } from '@/providers/openai.provider';
import { TAVILY_CLIENT } from '@/providers/tavily.provider';
import { ChunkPayloadSchema } from '@/providers/schemas/qdrant.schema';

import { CreateSearchDto } from './dto/create-search.dto';
import { SearchResponseDto } from './dto/search-response.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @Inject(QDRANT_CLIENT)
    private readonly qdrantClient: QdrantClient,
    @Inject(OPENAI_CLIENT)
    private readonly openai: OpenAI,
    @Inject(TAVILY_CLIENT)
    private readonly tavilyClient: ReturnType<typeof tavily> | null,
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

    // TODO: Maybe add a cutoff for the score?
    // TODO: See if we can implement Reciprocal Ranked Fusion or use a reranker model to rank the results
    // TODO: Use cohere's reranker model to rerank the results retrieved by Meilisearch as well
    const results = await this.qdrantClient.search('chunks', {
      vector: queryVector,
      limit: createSearchDto.max_results,
    });

    let searchResults = results.map((result) => {
      const payload = ChunkPayloadSchema.parse(result.payload);
      return {
        source_url: payload.source_url,
        title: payload.title,
        created_at: payload.created_at,
        updated_at: payload.updated_at,
        content: payload.content,
        score: result.score,
        id: result.id,
      };
    });

    // If backfilling is enabled and we have a Tavily client
    if (
      createSearchDto.should_backfill &&
      this.tavilyClient &&
      searchResults.length < createSearchDto.max_results
    ) {
      try {
        const tavilyResponse = await this.tavilyClient.search(
          createSearchDto.query,
          {
            search_depth: 'basic',
            include_answer: false,
            max_results: createSearchDto.max_results - searchResults.length,
          },
        );

        const tavilyResults = tavilyResponse.results.map((result) => ({
          title: result.title,
          source_url: result.url,
          content: result.content,
          score: result.score,
          created_at: new Date().toISOString(),
          updated_at: null,
          id: randomUUID(),
        }));

        searchResults = [...searchResults, ...tavilyResults];
      } catch (error) {
        this.logger.error('Failed to fetch Tavily results:', error);
        // Continue with existing results if Tavily fails
      }
    }

    return {
      query: createSearchDto.query,
      results: searchResults,
      total_results: searchResults.length,
      time_taken: (Date.now() - startTime) / 1_000,
    };
  }
}
