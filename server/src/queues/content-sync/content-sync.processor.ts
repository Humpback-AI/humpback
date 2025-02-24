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

  @Process('sync')
  async handleContentSync(job: Job<ContentSyncJob>) {
    this.logger.log(
      `Processing content sync job for chunk ID: ${job.data.chunkId}`,
    );

    try {
      const { data: chunk, error: fetchError } = await this.supabaseClient
        .from('chunks')
        .select('*')
        .eq('id', job.data.chunkId.toString())
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch chunk: ${fetchError.message}`);
      }

      if (!chunk) {
        throw new Error(`Chunk with ID ${job.data.chunkId} not found`);
      }

      const embeddingResponse = await this.openaiClient.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunk.content,
        encoding_format: 'float',
      });

      const embedding = embeddingResponse.data[0].embedding;

      const payload: ChunkPayloadType = {
        id: chunk.id,
        organization_id: chunk.organization_id,
        source_url: chunk.source_url,
        title: chunk.title,
        content: chunk.content,
        created_at: chunk.created_at,
        updated_at: chunk.updated_at,
      };

      await this.qdrantClient.upsert('chunks', {
        wait: true,
        points: [
          {
            id: chunk.id,
            payload,
            vector: embedding,
          },
        ],
      });

      this.logger.log(
        `Successfully processed content sync job for chunk ID: ${job.data.chunkId}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing content sync job: ${errorMessage}`);
      throw error;
    }
  }
}
