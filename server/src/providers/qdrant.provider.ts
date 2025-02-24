import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { Logger } from '@nestjs/common';

export const QDRANT_CLIENT = 'QDRANT_CLIENT';

export const QdrantProvider: Provider = {
  provide: QDRANT_CLIENT,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('QdrantProvider');

    const client = new QdrantClient({
      url: configService.get<string>('qdrant.url'),
      apiKey: configService.get<string>('qdrant.apiKey'),
    });

    // Test the connection
    try {
      await client.getCollections();
      logger.log('Successfully connected to Qdrant');
    } catch (error) {
      logger.error('Failed to connect to Qdrant:', error);
      throw error;
    }

    return client;
  },
};
