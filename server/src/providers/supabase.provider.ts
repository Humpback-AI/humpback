import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

import { Database } from '~/supabase/types';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

export const SupabaseProvider: Provider = {
  provide: SUPABASE_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const supabaseUrl = configService.getOrThrow<string>('supabase.url');
    const supabaseKey = configService.getOrThrow<string>('supabase.key');

    const client = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Since this is server-side, we don't need to persist the session
      },
    });

    return client;
  },
};
