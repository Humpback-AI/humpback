import { Module } from '@nestjs/common';

import { SearchService } from '@/search/search.service';
import { SearchController } from '@/search/search.controller';
import { QdrantProvider } from '@/providers/qdrant.provider';

@Module({
  controllers: [SearchController],
  providers: [SearchService, QdrantProvider],
})
export class SearchModule {}
