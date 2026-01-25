// utils/getEmbedding.js
const axios = require('axios');

const JINA_API_KEY = ''; //
require('dotenv').config();
async function getEmbedding(text) {
  if (!JINA_API_KEY) {
    console.log(JINA_API_KEY);
    console.log('key not foundd ');
    return null;
  }
  try {
    const res = await axios.post(
      'https://api.jina.ai/v1/embeddings',
      {
        input: [text],
        model: 'jina-embeddings-v2-base-en',
      },
      {
        headers: {
          'Authorization': `Bearer ${JINA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.data.data[0].embedding;
  } catch (err) {
    console.error('❌ Jina error:', err.response?.data || err.message);
    return null;
  }
}

module.exports = getEmbedding;
