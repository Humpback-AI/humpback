import { Module } from '@nestjs/common';

import { ContentSyncModule } from '@/queues/content-sync/content-sync.module';

import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [ContentSyncModule],
  controllers: [WebhooksController],
  providers: [],
})
export class WebhooksModule {}
