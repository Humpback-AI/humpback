declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    NEXT_PUBLIC_BASE_URL: string;
    HUMPBACK_SERVER_BASE_URL: string;
    HUMPBACK_SERVER_INTERNAL_SECRET_KEY: string;
  }
}
