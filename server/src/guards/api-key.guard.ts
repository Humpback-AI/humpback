import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';

import { Database, Tables } from '~/supabase/types';
import { SUPABASE_CLIENT } from '@/providers/supabase.provider';

interface RequestWithApiKey extends Request {
  apiKey: Tables<'api_keys'>;
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithApiKey>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('API key is required');
    }

    try {
      // Check if API key exists in Supabase
      const { data, error } = await this.supabase
        .from('api_keys')
        .select('*')
        .eq('key', token)
        .single();

      if (error || !data) {
        throw new UnauthorizedException('Invalid API key');
      }

      // Attach the API key data to the request for potential later use
      request.apiKey = data;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid API key');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
