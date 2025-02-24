import { Test, TestingModule } from '@nestjs/testing';

import { ContentSyncService } from '@/queues/content-sync/content-sync.service';

import { WebhooksController } from './webhooks.controller';

describe(WebhooksController, () => {
  let controller: WebhooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [ContentSyncService],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
