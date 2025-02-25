import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CohereClient } from 'cohere-ai';

export const COHERE_CLIENT = 'COHERE_CLIENT';

export const CohereProvider: Provider = {
  provide: COHERE_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const client = new CohereClient({
      token: configService.getOrThrow<string>('cohere.apiKey'),
    });

    return client;
  },
};
