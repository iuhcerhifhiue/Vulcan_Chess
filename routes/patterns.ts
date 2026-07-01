import express, { Request, Response, Router } from 'express';
import { analyzeGameHistory, Game, Pattern } from '../utils/patternAnalyzer'; // Updated import
import { getOrCreateUserProfile, UserProfile } from '../utils/database'; // Updated import

const router: Router = express.Router();

// Analyze user's game history and detect patterns
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { username, games } = req.body as { username: string; games: Game[] };
    
    if (!username || !games || games.length === 0) {
      return res.status(400).json({ error: 'Username and games are required' });
    }

    // Analyze patterns
    const patterns: Pattern[] = await analyzeGameHistory(games);
    
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
router.get('/user/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const userProfile: UserProfile = await getOrCreateUserProfile(username);
    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching patterns:', error);
    res.status(500).json({ error: 'Failed to fetch patterns' });
  }
});

export default router;
