import { Module } from '@nestjs/common';

import { SearchService } from '@/search/search.service';
import { SearchController } from '@/search/search.controller';
import { QdrantProvider } from '@/providers/qdrant.provider';
import { OpenAIProvider } from '@/providers/openai.provider';

@Module({
  controllers: [SearchController],
  providers: [SearchService, QdrantProvider, OpenAIProvider],
})
export class SearchModule {}
