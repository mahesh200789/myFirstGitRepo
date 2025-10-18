require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const { Pinecone } = require('@pinecone-database/pinecone');

// ✅ Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT
});

const index = pinecone.index('i4-insights');

// ✅ Chunking function
function chunkText(text, chunkSize = 500) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize).trim();
    if (chunk.length > 0) chunks.push(chunk);
  }
  return chunks;
}

// ✅ Read KB file
const rawText = fs.readFileSync('./kb/demo.txt', 'utf-8');
const chunks = chunkText(rawText);

// ✅ Embed and upload to Pinecone
async function embedAndUploadChunks(chunks, clientId) {
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    try {
      // 🔗 Embed via OpenAI
      const embeddingResponse = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          input: chunk,
          model: 'text-embedding-3-small'
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const embedding = embeddingResponse.data.data[0].embedding;

      // 🧠 Upsert to Pinecone
      await index.upsert([
        {
          id: `${clientId}-chunk-${i}-${Date.now()}`,
          values: embedding,
          metadata: {
            client_id: clientId,
            text: chunk
          }
        }
      ]);

      console.log(`✅ Uploaded chunk ${i + 1}/${chunks.length}`);
    } catch (err) {
      console.error(`❌ Failed chunk ${i + 1}:`, err.message);
    }
  }

  console.log('🎉 All chunks processed.');
}

// 🚀 Run the upload
embedAndUploadChunks(chunks, 'demo');