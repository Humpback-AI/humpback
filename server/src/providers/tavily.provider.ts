import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tavily } from '@tavily/core';

export const TAVILY_CLIENT = 'TAVILY_CLIENT';

export const TavilyProvider: Provider = {
  provide: TAVILY_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const apiKey = configService.get<string>('tavily.apiKey');

    const client = tavily({
      apiKey,
    });

    return client;
  },
};
