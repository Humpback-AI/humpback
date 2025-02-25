import { z } from "zod";

export const postSearchChunksSchema = z.object({
  query: z.string(),
  hitsPerPage: z.number().optional().default(10),
  page: z.number().optional().default(1),
  workspaceId: z.string(),
});

export type PostSearchChunksSchema = z.infer<typeof postSearchChunksSchema>;
