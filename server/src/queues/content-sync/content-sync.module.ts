import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { QdrantProvider } from '@/providers/qdrant.provider';
import { SupabaseProvider } from '@/providers/supabase.provider';
import { OpenAIProvider } from '@/providers/openai.provider';

import { ContentSyncProcessor } from './content-sync.processor';
import { ContentSyncService } from './content-sync.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'content-sync',
    }),
  ],
  providers: [
    ContentSyncProcessor,
    ContentSyncService,
    QdrantProvider,
    SupabaseProvider,
    OpenAIProvider,
  ],
  exports: [ContentSyncService],
})
export class ContentSyncModule {}
