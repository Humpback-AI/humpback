import { QdrantClient } from '@qdrant/js-client-rest';
import { MeiliSearch } from 'meilisearch';

async function setupQdrant() {
  try {
    // Check for required environment variables
    const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6334';
    const qdrantApiKey = process.env.QDRANT_API_KEY;

    if (!qdrantApiKey) {
      console.error('Error: QDRANT_API_KEY environment variable is required');
      process.exit(1);
    }

    // Initialize Qdrant client
    const client = new QdrantClient({
      url: qdrantUrl,
      apiKey: qdrantApiKey,
    });

    // Collection name for the vector database
    const collectionName = 'chunks';

    // Check if collection already exists
    try {
      const existingCollection = await client.getCollection(collectionName);
      if (existingCollection) {
        console.error(
          `Error: Collection "${collectionName}" already exists. Please remove it manually if you want to recreate it.`,
        );
        process.exit(1);
      }
    } catch {
      // Collection doesn't exist, we can proceed
      console.log(`Collection "${collectionName}" does not exist, creating...`);
    }

    // Create collection with specified configuration
    await client.createCollection(collectionName, {
      vectors: {
        '': {
          size: 1536, // OpenAI embedding size
          distance: 'Cosine',
          quantization_config: {
            scalar: { type: 'int8', always_ram: true },
          },
          on_disk: true,
          hnsw_config: { payload_m: 16, m: 0 },
        },
      },
      optimizers_config: { default_segment_number: 2 },
      shard_number: 2,
    });

    console.log(`Created collection: ${collectionName}`);

    // Verify collection was created
    const info = await client.getCollection(collectionName);
    console.log('Collection info:', JSON.stringify(info, null, 2));
  } catch (error) {
    console.error('Error setting up Qdrant:', error);
    process.exit(1);
  }
}

async function setupMeilisearch() {
  try {
    // Check for required environment variables
    const meilisearchUrl =
      process.env.MEILISEARCH_URL || 'http://localhost:7700';
    const meilisearchApiKey = process.env.MEILISEARCH_API_KEY;

    const client = new MeiliSearch({
      host: meilisearchUrl,
      apiKey: meilisearchApiKey,
    });

    const index = client.index('chunks');

    await index.updateSearchableAttributes(['content', 'title']);
    await index.updateFilterableAttributes(['workspace_id', 'user_id']);
    await index.updateSortableAttributes([
      'created_at_timestamp',
      'updated_at_timestamp',
    ]);

    console.log('Meilisearch setup complete.');
  } catch (error) {
    console.error('Error setting up Meilisearch:', error);
    process.exit(1);
  }
}

// Run setup
async function runSetup() {
  try {
    await setupQdrant();
    await setupMeilisearch();
    console.log('Setup completed successfully!');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

runSetup().catch(console.error);
