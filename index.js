const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');
const { getRelevantChunks } = require('./utils/getRelevantChunks');
const { sendToWhatsApp } = require('./utils/sendToWhatsApp');
const app = express();
app.use(express.json());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello Mahesh!');
});

////ORIGINAL WEBHOOK ROUTE
// app.post('/webhook', async (req, res) => {
//   const userMessage = req.body.message;
//   const clientId = req.body.client_id; // Identify which client's KB to use

//   // Step 1: Retrieve relevant chunks from vector DB (RAG)
//   const retrievedChunks = await getRelevantChunks(userMessage, clientId);

//   // Step 2: Build prompt
//   const prompt = `User asked: "${userMessage}". Based on the following context: ${retrievedChunks.join('\n')}`;

//   // Step 3: Send to OpenAI
//   const response = await axios.post('https://api.openai.com/v1/chat/completions', {
//     model: 'gpt-4',
//     messages: [{ role: 'user', content: prompt }],
//   }, {
//     headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
//   });

//   const reply = response.data.choices[0].message.content;

//   // Step 4: Send reply back to WhatsApp API
//   await sendToWhatsApp(req.body.user_id, reply);

//   res.sendStatus(200);
// });


////Updated /webhook Route with whatappa flow
//const { getRelevantChunks } = require('./utils/getRelevantChunks');
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/webhook', async (req, res) => {
  const userMessage = req.body.message;
  const clientId = req.body.client_id || 'demo'; // fallback if missing
  const userId = req.body.user_id;

  try {
    // Step 1: Retrieve relevant chunks
    const retrievedChunks = await getRelevantChunks(userMessage, clientId);
    const context = retrievedChunks.length > 0
      ? retrievedChunks.join('\n')
      : 'No relevant context found. Answer based on general knowledge.';

    // Step 2: Build prompt
    const prompt = `Use the following context to answer the question:\n\n${context}\n\nQuestion: ${userMessage}`;

    // Step 3: Send to OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for a professional client.' },
        { role: 'user', content: prompt }
      ]
    });

    const reply = completion.choices[0].message.content;

    // Step 4: Send reply back to WhatsApp
    await sendToWhatsApp(userId, reply);  // userId 

    res.sendStatus(200);
  } catch (err) {
    console.error('Error in /webhook:', err);
    res.sendStatus(500);
  }
});








const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


async function askOpenAI(prompt) {
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  }, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data.choices[0].message.content;
}
