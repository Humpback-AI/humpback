import { MeiliSearch } from "meilisearch";

// Initialize the Meilisearch client
const client = new MeiliSearch({
  host: process.env.MEILISEARCH_URL || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_KEY,
});

export default client;
