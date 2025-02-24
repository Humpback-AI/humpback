import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';
import { createHash } from 'crypto';

import { Database, Tables } from '@/providers/types/supabase.types';
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
      // Hash the API key before checking
      const hashedToken = this.hashApiKey(token);

      // Check if API key exists in Supabase
      const { data, error } = await this.supabase
        .from('api_keys')
        .select('*')
        .eq('hashed_key', hashedToken)
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

  private hashApiKey(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex');
  }
}
