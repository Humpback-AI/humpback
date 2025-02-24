import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

import { ContentSyncJob } from './types';

@Injectable()
export class ContentSyncService {
  constructor(
    @InjectQueue('content-sync')
    private contentSyncQueue: Queue<ContentSyncJob>,
  ) {}

  async addContentSyncJob(chunkIds: string[]) {
    return this.contentSyncQueue.add(
      'sync',
      { chunkIds },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1_000,
        },
      },
    );
  }
}
