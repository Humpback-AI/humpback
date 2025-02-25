import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
import { tavily } from '@tavily/core';
import { randomUUID } from 'crypto';
import { CohereClient } from 'cohere-ai';
import * as R from 'remeda';

import { QDRANT_CLIENT } from '@/providers/qdrant.provider';
import { OPENAI_CLIENT } from '@/providers/openai.provider';
import { TAVILY_CLIENT } from '@/providers/tavily.provider';
import { ChunkPayloadSchema } from '@/providers/schemas/qdrant.schema';
import { COHERE_CLIENT } from '@/providers/cohere.provider';
import { MeilisearchClient } from '@/providers/meilisearch.provider';
import { MEILISEARCH_CLIENT } from '@/providers/meilisearch.provider';

import { CreateSearchDto } from './dto/create-search.dto';
import { SearchResponseDto } from './dto/search-response.dto';

interface SearchResult {
  source_url: string;
  title: string;
  created_at: string;
  updated_at: string | null;
  content: string;
  score: number;
  id: string;
}

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

  private async rerankResults(
    results: SearchResult[],
    query: string,
  ): Promise<SearchResult[]> {
    if (results.length === 0) return results;

    try {
      const rerankedResults = await this.cohereClient.rerank({
        documents: results.map((result) => result.content),
        query: query,
        model: 'rerank-v3.5',
        returnDocuments: true,
      });

      // Map the reranked results back to our format
      const updatedResults = rerankedResults.results.map((result, index) => ({
        ...results[index],
        score: result.relevanceScore,
      }));

      // Sort by relevance score in descending order
      return updatedResults.sort((a, b) => b.score - a.score);
    } catch (error) {
      this.logger.error('Failed to rerank results with Cohere:', error);
      return results;
    }
  }

  private async backfillResults(
    currentResults: SearchResult[],
    query: string,
    maxResults: number,
  ): Promise<SearchResult[]> {
    if (!this.tavilyClient || currentResults.length >= maxResults) {
      return currentResults;
    }

    try {
      const tavilyResponse = await this.tavilyClient.search(query, {
        search_depth: 'basic',
        include_answer: false,
        max_results: maxResults - currentResults.length,
      });

      const tavilyResults = tavilyResponse.results.map((result) => ({
        title: result.title,
        source_url: result.url,
        content: result.content,
        score: result.score,
        created_at: new Date().toISOString(),
        updated_at: null,
        id: randomUUID(),
      }));

      return [...currentResults, ...tavilyResults];
    } catch (error) {
      this.logger.error('Failed to fetch Tavily results:', error);
      return currentResults;
    }
  }

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
    const qdrantSearchResults: SearchResult[] = qdrantResults.map((result) => {
      const payload = ChunkPayloadSchema.parse(result.payload);
      return {
        source_url: payload.source_url,
        title: payload.title,
        created_at: payload.created_at,
        updated_at: payload.updated_at,
        content: payload.content,
        score: result.score,
        id: String(result.id),
      };
    });

    // Process Meilisearch results
    const meilisearchSearchResults: SearchResult[] =
      meilisearchResults.hits.map((hit) => ({
        source_url: hit.source_url,
        title: hit.title,
        created_at: hit.created_at,
        updated_at: hit.updated_at,
        content: hit.content,
        score: 0,
        id: String(hit.id),
      }));

    // Combine results from both sources
    let combinedResults = R.uniqueBy(
      [...qdrantSearchResults, ...meilisearchSearchResults],
      (result) => result.id,
    );

    // Rerank the combined results using Cohere
    combinedResults = await this.rerankResults(
      combinedResults,
      createSearchDto.query,
    );
    combinedResults = combinedResults.slice(0, createSearchDto.max_results);

    // Backfill results if needed using Tavily
    if (createSearchDto.should_backfill) {
      combinedResults = await this.backfillResults(
        combinedResults,
        createSearchDto.query,
        createSearchDto.max_results,
      );
    }

    return {
      query: createSearchDto.query,
      results: combinedResults,
      total_results: combinedResults.length,
      time_taken: (Date.now() - startTime) / 1_000,
    };
  }
}
