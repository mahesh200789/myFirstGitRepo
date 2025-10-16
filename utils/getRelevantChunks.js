
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index('i4-insights');

async function getRelevantChunks(query, clientId, topK = 5) {
  // Step 1: Embed the query
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;

  // Step 2: Query Pinecone
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter: {
      client_id: clientId
    }
  });

  // Step 3: Extract matched chunks
  const matchedChunks = results.matches.map(match => match.metadata.text);

  return matchedChunks;
}

module.exports = { getRelevantChunks };