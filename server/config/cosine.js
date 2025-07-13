// clusterFeedback.js
const getEmbedding = require('./jina');
const cosineSimilarity = require('compute-cosine-similarity');
const cleanText = require('../utils/cleanText');

//dictionary 
const storedFeedbacks = [
  {
    text: "Navbar is not working",
    vector: null // will be generated
  },
  {
    text: "Top menu doesn't respond on click",
    vector: null
  },
  {
    text: "Feedback button works great", // unrelated
    vector: null
  }
];

// Main function
(async () => {
  // Generate embeddings for stored feedbacks (only once in real app)
  for (let fb of storedFeedbacks) {
    if (!fb.vector) {
      fb.vector = await getEmbedding(fb.text);
    }
  }
  let dataa = 'header not working when  click of hamburger it does not load the header'
  dataa = cleanText(dataa);
  console.log(dataa);
  // New feedback to check
  const newFeedback = {
    text: dataa,
    vector: await getEmbedding(dataa)
  };

  console.log("\n🔍 Comparing with existing feedbacks:\n");

  for (let fb of storedFeedbacks) {
    const sim = cosineSimilarity(fb.vector, newFeedback.vector);
    console.log(`🧠 Similarity with "${fb.text}" →`, sim.toFixed(3));

    if (sim > 0.85) {
      console.log(`✅ Grouped with: "${fb.text}" (sim = ${sim.toFixed(3)})\n`);
    }
  }
})();
