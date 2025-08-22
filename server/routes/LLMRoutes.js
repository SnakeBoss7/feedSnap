const express = require('express'); 
const router = express.Router();
router.post('/llmquery', async (req, res) => {
    const { userMessage } = req.body;
    try {
        console.log(userMessage);
        res.json({ res:"worked"});
    } catch (error) {
        console.error('Error fetching LLM response:', error);
        res.status(500).json({ error: 'Failed to fetch LLM response' });
    }
});
module.exports = router;