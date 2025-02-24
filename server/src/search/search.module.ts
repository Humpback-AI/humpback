import { Module } from '@nestjs/common';

import { SearchService } from '@/search/search.service';
import { SearchController } from '@/search/search.controller';
import { QdrantProvider } from '@/providers/qdrant.provider';
import { OpenAIProvider } from '@/providers/openai.provider';
import { ApiKeyGuard } from '@/guards/api-key.guard';
import { SupabaseProvider } from '@/providers/supabase.provider';
import { TavilyProvider } from '@/providers/tavily.provider';

@Module({
  controllers: [SearchController],
  providers: [
    SearchService,
    QdrantProvider,
    OpenAIProvider,
    ApiKeyGuard,
    SupabaseProvider,
    TavilyProvider,
  ],
})
export class SearchModule {}
