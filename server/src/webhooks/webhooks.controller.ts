import { Controller, Post, Body } from '@nestjs/common';

import { ContentSyncService } from '@/queues/content-sync/content-sync.service';

import { ContentSyncDto } from './dto/content-sync.dto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly contentSyncService: ContentSyncService) {}

  @Post('content-sync')
  async triggerContentSync(@Body() body: ContentSyncDto) {
    const job = await this.contentSyncService.addContentSyncJob(body.chunk_id);
    return { jobId: job.id, status: 'queued' };
  }
}
