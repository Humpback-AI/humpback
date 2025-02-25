import { NextResponse } from "next/server";
import { z } from "zod";
import status from "http-status";

import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

// Define the validation schema
const ContentSyncSchema = z.object({
  chunk_ids: z
    .array(z.string().uuid())
    .describe("The ids of the chunks to sync"),
});

// Type for the validated request
type ContentSyncRequest = z.infer<typeof ContentSyncSchema>;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError) {
      return NextResponse.json(
        { error: "Authentication error", message: authError.message },
        { status: status.FORBIDDEN }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: status.UNAUTHORIZED }
      );
    }

    // Parse and validate the request body
    let requestBody: ContentSyncRequest;
    try {
      const rawBody = await request.json();
      const result = ContentSyncSchema.safeParse(rawBody);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Invalid request",
            details: result.error.format(),
          },
          { status: status.BAD_REQUEST }
        );
      }

      requestBody = result.data;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: status.BAD_REQUEST }
      );
    }

    // Forward request to Humpback server
    const humpbackUrl = `${process.env.HUMPBACK_SERVER_BASE_URL}/webhooks/content-sync`;

    const response = await fetch(humpbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUMPBACK_SERVER_INTERNAL_SECRET_KEY}`,
      },
      body: JSON.stringify({
        ...requestBody,
        userId: session.user.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          error: "Humpback server error",
          status: response.status,
          message: errorData.message || response.statusText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: status.INTERNAL_SERVER_ERROR }
    );
  }
}
