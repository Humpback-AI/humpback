import { Controller, Post, Body } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

import { SearchService } from './search.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { SearchResponseDto } from './dto/search-response.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async create(
    @Body(ZodValidationPipe) createSearchDto: CreateSearchDto,
  ): Promise<SearchResponseDto> {
    return this.searchService.create(createSearchDto);
  }
}
