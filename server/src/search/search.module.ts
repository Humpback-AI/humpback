import { Module } from '@nestjs/common';

import { SearchService } from '@/search/search.service';
import { SearchController } from '@/search/search.controller';
import { QdrantProvider } from '@/providers/qdrant.provider';
import { OpenAIProvider } from '@/providers/openai.provider';
import { ApiKeyGuard } from '@/guards/api-key.guard';
import { SupabaseProvider } from '@/providers/supabase.provider';

@Module({
  controllers: [SearchController],
  providers: [
    SearchService,
    QdrantProvider,
    OpenAIProvider,
    ApiKeyGuard,
    SupabaseProvider,
  ],
})
export class SearchModule {}
