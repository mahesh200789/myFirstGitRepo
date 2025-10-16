require('dotenv').config();

const { getRelevantChunks } = require('../utils/getRelevantChunks');

(async () => {
  const chunks = await getRelevantChunks('what is RAG?', 'demo');
  console.log('Matched chunks:', chunks);
})();
