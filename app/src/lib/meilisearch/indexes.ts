import { ChunkPayload } from "~/meilisearch/types";

import client from "./server";

const chunksIndex = client.index<ChunkPayload>("chunks");

export { chunksIndex };
