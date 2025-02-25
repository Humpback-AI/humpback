import { Module } from '@nestjs/common';

import { ContentSyncModule } from '@/queues/content-sync/content-sync.module';
import { SupabaseProvider } from '@/providers/supabase.provider';

import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [ContentSyncModule],
  controllers: [WebhooksController],
  providers: [SupabaseProvider],
})
export class WebhooksModule {}
