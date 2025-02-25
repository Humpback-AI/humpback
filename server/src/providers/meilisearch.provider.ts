import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';
import { Logger } from '@nestjs/common';

export const MEILISEARCH_CLIENT = 'MEILISEARCH_CLIENT';

export const MeilisearchProvider: Provider = {
  provide: MEILISEARCH_CLIENT,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('MeilisearchProvider');

    const client = new MeiliSearch({
      host: configService.getOrThrow<string>('meilisearch.host'),
      apiKey: configService.getOrThrow<string>('meilisearch.apiKey'),
    });

    // Test the connection
    try {
      await client.health();
      logger.log('Successfully connected to Meilisearch');
    } catch (error) {
      logger.error('Failed to connect to Meilisearch:', error);
      throw error;
    }

    return client;
  },
};
