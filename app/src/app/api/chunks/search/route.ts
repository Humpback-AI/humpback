import { NextRequest, NextResponse } from "next/server";
import status from "http-status";
import { z } from "zod";

import { chunksIndex } from "@/lib/meilisearch/indexes";
import { postSearchChunksSchema } from "@/app/schemas/api/chunks/search/schema";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { query, page, hitsPerPage, workspaceId } =
      postSearchChunksSchema.parse(await request.json());

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: status.UNAUTHORIZED }
      );
    }

    const { data: workspaceRole } = await supabase
      .from("workspace_roles")
      .select()
      .eq("workspace_id", workspaceId)
      .eq("user_id", session.user.id)
      .single();

    if (!workspaceRole) {
      return NextResponse.json(
        { error: "Access denied to this workspace" },
        { status: status.FORBIDDEN }
      );
    }

    const results = await chunksIndex.search(query, {
      page,
      hitsPerPage,
      filter: `workspace_id=${workspaceId}`,
    });

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: status.BAD_REQUEST }
      );
    }

    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: status.INTERNAL_SERVER_ERROR }
    );
  }
}
