import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

import { ContentSyncService } from '@/queues/content-sync/content-sync.service';
import { SupabaseAuthGuard } from '@/guards/supabase-auth.guard';

import { ContentSyncDto } from './dto/content-sync.dto';

@Controller('webhooks')
@UseGuards(SupabaseAuthGuard)
export class WebhooksController {
  constructor(private readonly contentSyncService: ContentSyncService) {}

  @Post('content-sync')
  async triggerContentSync(@Body(ZodValidationPipe) body: ContentSyncDto) {
    const job = await this.contentSyncService.addContentSyncJob(body.chunk_ids);
    return { jobId: job.id, status: 'queued' };
  }
}
