import { MeiliSearch } from "meilisearch";

async function setup() {
  try {
    // Check for required environment variables
    const meilisearchUrl =
      process.env.MEILISEARCH_URL || "http://localhost:7700";
    const meilisearchApiKey = process.env.MEILISEARCH_API_KEY;

    const client = new MeiliSearch({
      host: meilisearchUrl,
      apiKey: meilisearchApiKey,
    });

    const index = client.index("chunks");

    await index.updateSearchableAttributes(["content", "title"]);
    await index.updateFilterableAttributes(["workspace_id", "user_id"]);
    await index.updateSortableAttributes([
      "created_at_timestamp",
      "updated_at_timestamp",
    ]);

    console.log("Meilisearch setup complete.");
  } catch (error) {
    console.error("Error setting up Meilisearch:", error);
    process.exit(1);
  }
}

setup().catch(console.error);
