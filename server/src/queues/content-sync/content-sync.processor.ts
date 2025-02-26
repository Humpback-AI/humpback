import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QdrantClient } from '@qdrant/js-client-rest';
import { SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

import { QDRANT_CLIENT } from '@/providers/qdrant.provider';
import { SUPABASE_CLIENT } from '@/providers/supabase.provider';
import { OPENAI_CLIENT } from '@/providers/openai.provider';
import {
  MEILISEARCH_CLIENT,
  MeilisearchClient,
} from '@/providers/meilisearch.provider';
import { Database } from '~/supabase/types';
import { ChunkPayloadType } from '@/search/dto/chunk-payload.dto';

import { ContentSyncJob } from './types';

@Processor('content-sync')
export class ContentSyncProcessor {
  private readonly logger = new Logger(ContentSyncProcessor.name);

  constructor(
    @Inject(QDRANT_CLIENT)
    private readonly qdrantClient: QdrantClient,
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient<Database>,
    @Inject(OPENAI_CLIENT)
    private readonly openaiClient: OpenAI,
    @Inject(MEILISEARCH_CLIENT)
    private readonly meilisearchClient: MeilisearchClient,
  ) {}

  private formatEmbeddingInput(title: string, content: string): string {
    return `Title: ${title}\n\nContent: ${content}`;
  }

  @Process('sync')
  async handleContentSync(job: Job<ContentSyncJob>) {
    this.logger.log(
      `Processing content sync job for chunk IDs: ${job.data.chunkIds.join(
        ', ',
      )}`,
    );

    try {
      const { data: chunks, error: fetchError } = await this.supabaseClient
        .from('chunks')
        .select('*')
        .in('id', job.data.chunkIds);

      if (fetchError) {
        throw new Error(`Failed to fetch chunks: ${fetchError.message}`);
      }

      // Find chunks that no longer exist in Supabase
      const existingChunkIds = new Set(chunks.map((chunk) => chunk.id));
      const deletedChunkIds = job.data.chunkIds.filter(
        (id) => !existingChunkIds.has(id),
      );

      // Delete non-existent chunks from both Qdrant and Meilisearch
      if (deletedChunkIds.length > 0) {
        this.logger.log(
          `Deleting chunks that no longer exist: ${deletedChunkIds.join(', ')}`,
        );
        await Promise.all([
          this.qdrantClient.delete('chunks', {
            wait: true,
            points: deletedChunkIds,
          }),
          this.meilisearchClient.chunks.deleteDocuments(deletedChunkIds),
        ]);
      }

      // If there are no chunks to process, we're done
      if (chunks.length === 0) {
        this.logger.log('No chunks to process');
        return;
      }

      const embeddingResponse = await this.openaiClient.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunks.map((chunk) =>
          this.formatEmbeddingInput(chunk.title, chunk.content),
        ),
        encoding_format: 'float',
      });

      const payloads: ChunkPayloadType[] = chunks.map((chunk) => ({
        id: chunk.id,
        source_url: chunk.source_url,
        title: chunk.title,
        content: chunk.content,
        created_at: new Date(chunk.created_at).toISOString(),
        updated_at: chunk.updated_at
          ? new Date(chunk.updated_at).toISOString()
          : null,
        user_id: chunk.user_id,
      }));

      // Update both Qdrant and Meilisearch
      await Promise.all([
        this.qdrantClient.upsert('chunks', {
          wait: true,
          points: payloads.map((payload, index) => ({
            id: payload.id,
            payload,
            vector: embeddingResponse.data[index].embedding,
          })),
        }),
        this.meilisearchClient.chunks.addDocuments(
          payloads.map((payload) => ({
            ...payload,
            created_at_timestamp: new Date(payload.created_at).getTime(),
            updated_at_timestamp: payload.updated_at
              ? new Date(payload.updated_at).getTime()
              : null,
            user_id: payload.user_id,
          })),
          { primaryKey: 'id' },
        ),
      ]);

      this.logger.log(
        `Successfully processed content sync job for chunk IDs: ${job.data.chunkIds.join(
          ', ',
        )}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing content sync job: ${errorMessage}`);
      throw error;
    }
  }
}
