export type ChunkPayload = {
  id: string;
  workspace_id: string;
  source_url: string;
  title: string;
  created_at: string;
  updated_at: string | null;
  created_at_timestamp: number;
  updated_at_timestamp: number | null;
  content: string;
  user_id: string | null;
};
