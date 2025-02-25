import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { Tables } from '~/supabase/types';

interface RequestWithApiKey extends Request {
  apiKey: Tables<'api_keys'>;
}

export const ApiKey = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Tables<'api_keys'> => {
    const request = ctx.switchToHttp().getRequest<RequestWithApiKey>();
    return request.apiKey;
  },
);
