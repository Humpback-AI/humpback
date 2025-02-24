import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export const OPENAI_CLIENT = 'OPENAI_CLIENT';

export const OpenAIProvider: Provider = {
  provide: OPENAI_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const client = new OpenAI({
      apiKey: configService.getOrThrow<string>('openai.apiKey'),
      maxRetries: 3,
    });

    return client;
  },
};
