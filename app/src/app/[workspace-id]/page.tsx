"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { useTinybird } from "@/contexts/TinybirdContext";

const ENDPOINT_URL =
  "https://api.us-east.aws.tinybird.co/v0/pipes/chunks_referenced_by_search.json";

export default function HomePage() {
  const params = useParams();
  const workspaceId = params["workspace-id"]?.toString() ?? "";
  const { fetchWithToken } = useTinybird();

  // FIXME: There's an issue with token signing
  const { data } = useQuery({
    queryKey: ["tinybird-analytics", workspaceId],
    queryFn: () =>
      fetchWithToken(ENDPOINT_URL, {
        workspace_id: workspaceId,
      }),
  });
  console.log("🚀 ~ HomePage ~ data:", data);

  return <div>Home</div>;
}
