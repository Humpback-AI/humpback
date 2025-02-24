import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchModule } from './search/search.module';
import { ContentSyncModule } from './queues/content-sync/content-sync.module';
import { validationSchema } from './config/config.validation';
import qdrantConfig from './config/qdrant.config';
import openaiConfig from './config/openai.config';
import supabaseConfig from './config/supabase.config';
import internalConfig from './config/internal.config';
import tavilyConfig from './config/tavily.config';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [
        qdrantConfig,
        openaiConfig,
        supabaseConfig,
        internalConfig,
        tavilyConfig,
      ],
      validationSchema: validationSchema,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.getOrThrow('REDIS_HOST'),
          port: configService.getOrThrow('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    SearchModule,
    ContentSyncModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
