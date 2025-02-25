import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
import { tavily } from '@tavily/core';
import { randomUUID } from 'crypto';
import { CohereClient } from 'cohere-ai';

import { QDRANT_CLIENT } from '@/providers/qdrant.provider';
import { OPENAI_CLIENT } from '@/providers/openai.provider';
import { TAVILY_CLIENT } from '@/providers/tavily.provider';
import { ChunkPayloadSchema } from '@/providers/schemas/qdrant.schema';
import { COHERE_CLIENT } from '@/providers/cohere.provider';
import { MeilisearchClient } from '@/providers/meilisearch.provider';
import { MEILISEARCH_CLIENT } from '@/providers/meilisearch.provider';

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
    @Inject(COHERE_CLIENT)
    private readonly cohereClient: CohereClient,
    @Inject(MEILISEARCH_CLIENT)
    private readonly meilisearchClient: MeilisearchClient,
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

    // Run Qdrant and Meilisearch searches in parallel
    const [qdrantResults, meilisearchResults] = await Promise.all([
      this.qdrantClient.search('chunks', {
        vector: queryVector,
        limit: createSearchDto.max_results,
      }),
      this.meilisearchClient.chunks.search(createSearchDto.query, {
        limit: createSearchDto.max_results,
      }),
    ]);

    // Process Qdrant results
    const qdrantSearchResults = qdrantResults.map((result) => {
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

    // Process Meilisearch results
    const meilisearchSearchResults = meilisearchResults.hits.map((hit) => ({
      source_url: hit.source_url,
      title: hit.title,
      created_at: hit.created_at,
      updated_at: hit.updated_at,
      content: hit.content,
      score: 0,
      id: String(hit.id),
    }));

    // Combine results from both sources
    let combinedResults = [...qdrantSearchResults, ...meilisearchSearchResults];

    // Use Cohere to rerank the combined results
    if (combinedResults.length > 0) {
      try {
        const rerankedResults = await this.cohereClient.rerank({
          documents: combinedResults.map((result) => result.content),
          query: createSearchDto.query,
          model: 'rerank-v3.5',
          returnDocuments: true,
        });

        // Map the reranked results back to our format
        combinedResults = rerankedResults.results.map((result, index) => ({
          ...combinedResults[index],
          score: result.relevanceScore,
        }));

        // Sort by relevance score in descending order
        combinedResults.sort((a, b) => b.score - a.score);

        // Limit to max_results
        combinedResults = combinedResults.slice(0, createSearchDto.max_results);
      } catch (error) {
        this.logger.error('Failed to rerank results with Cohere:', error);
        // Continue with existing results if reranking fails
      }
    }

    // If backfilling is enabled and we have a Tavily client
    if (
      createSearchDto.should_backfill &&
      this.tavilyClient &&
      combinedResults.length < createSearchDto.max_results
    ) {
      try {
        const tavilyResponse = await this.tavilyClient.search(
          createSearchDto.query,
          {
            search_depth: 'basic',
            include_answer: false,
            max_results: createSearchDto.max_results - combinedResults.length,
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

        combinedResults = [...combinedResults, ...tavilyResults];
      } catch (error) {
        this.logger.error('Failed to fetch Tavily results:', error);
        // Continue with existing results if Tavily fails
      }
    }

    return {
      query: createSearchDto.query,
      results: combinedResults,
      total_results: combinedResults.length,
      time_taken: (Date.now() - startTime) / 1_000,
    };
  }
}
