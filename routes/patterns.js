import express from 'express';
import { analyzeGameHistory } from '../utils/patternAnalyzer.js';
import { getOrCreateUserProfile } from '../utils/database.js';

const router = express.Router();

// Analyze user's game history and detect patterns
router.post('/analyze', async (req, res) => {
  try {
    const { username, games } = req.body;
    
    if (!username || !games || games.length === 0) {
      return res.status(400).json({ error: 'Username and games required' });
    }

    // Analyze patterns
    const patterns = await analyzeGameHistory(games);
    
    // Save user profile and patterns
    await getOrCreateUserProfile(username, patterns);
    
    res.json({
      username,
      patterns: patterns.slice(0, 3), // Top 3 patterns
      totalGamesAnalyzed: games.length,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Get user's stored patterns
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const userProfile = await getOrCreateUserProfile(username);
    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patterns' });
  }
});

export default router;
