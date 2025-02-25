declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    NEXT_PUBLIC_BASE_URL: string;
    NEXT_PUBLIC_HUMPBACK_SERVER_BASE_URL: string;
    MEILISEARCH_URL: string;
    MEILISEARCH_KEY: string;
  }
}
