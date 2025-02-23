import { Provider } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

export const QDRANT_CLIENT = 'QDRANT_CLIENT';

export const QdrantProvider: Provider = {
  provide: QDRANT_CLIENT,
  useFactory: async () => {
    const client = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY,
    });

    // Test the connection
    try {
      await client.getCollections();
      console.log('Successfully connected to Qdrant');
    } catch (error) {
      console.error('Failed to connect to Qdrant:', error);
      throw error;
    }

    return client;
  },
};
