import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { SearchModule } from '@/search/search.module';
import { validationSchema } from '@/config/config.validation';
import qdrantConfig from '@/config/qdrant.config';
import openaiConfig from '@/config/openai.config';
import supabaseConfig from '@/config/supabase.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [qdrantConfig, openaiConfig, supabaseConfig],
      validationSchema: validationSchema as Joi.ObjectSchema,
    }),
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
