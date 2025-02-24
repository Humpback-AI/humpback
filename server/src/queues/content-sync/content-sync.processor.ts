import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QdrantClient } from '@qdrant/js-client-rest';
import { SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

import { QDRANT_CLIENT } from '@/providers/qdrant.provider';
import { SUPABASE_CLIENT } from '@/providers/supabase.provider';
import { OPENAI_CLIENT } from '@/providers/openai.provider';
import { Database } from '@/providers/types/supabase.types';
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

      const embeddingResponse = await this.openaiClient.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunks.map((chunk) =>
          this.formatEmbeddingInput(chunk.title, chunk.content),
        ),
        encoding_format: 'float',
      });

      const payloads: ChunkPayloadType[] = chunks.map((chunk) => ({
        id: chunk.id,
        organization_id: chunk.organization_id,
        source_url: chunk.source_url,
        title: chunk.title,
        content: chunk.content,
        created_at: new Date(chunk.created_at).toISOString(),
        updated_at: chunk.updated_at
          ? new Date(chunk.updated_at).toISOString()
          : null,
      }));

      await this.qdrantClient.upsert('chunks', {
        wait: true,
        points: payloads.map((payload, index) => ({
          id: payload.id,
          payload,
          vector: embeddingResponse.data[index].embedding,
        })),
      });

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
