require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  //  controllerHostUrl: process.env.PINECONE_HOST_URL

});


const index = pinecone.index('i4-insights');

function chunkText(text, chunkSize = 500) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
}

const rawText = fs.readFileSync('./kb/demo.txt', 'utf-8');
const chunks = chunkText(rawText);

async function embedAndUploadChunks(chunks, clientId) {
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        // Embed
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

        console.log('Embedding type:', typeof embedding);
        console.log('Is array:', Array.isArray(embedding));
        console.log('Length:', embedding.length);


        // Upsert
        // await index.upsert({
        //     vectors: [
        //         {
        //             id: `${clientId}-chunk-${i}`,
        //             values: embedding,
        //             metadata: {
        //                 client_id: clientId,
        //                 text: chunk
        //             }
        //         }
        //     ]
        // });
        await index.upsert([
            {
                id: `${clientId}-chunk-${i}`,
                values: embedding,
                metadata: {
                    client_id: clientId,
                    text: chunk
                }
            }
        ]);


        console.log(`Uploaded chunk ${i + 1}/${chunks.length}`);
    }
}

embedAndUploadChunks(chunks, 'demo');
