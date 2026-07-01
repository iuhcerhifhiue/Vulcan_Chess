import express, { Request, Response, Router } from 'express';
// import { analyzeGameHistory } from '../utils/patternAnalyzer.js'; // Will be .ts later
// import { getOrCreateUserProfile } from '../utils/database.js'; // Will be .ts later

const router: Router = express.Router();

interface Game {
  // Define game structure based on what Chess.com API returns
  // and what analyzeGameHistory expects
  pgn: string;
  url: string;
  // ... other game properties
}

interface Pattern {
  type: string;
  description: string;
  frequency: number;
  // ... other pattern properties
}

interface UserProfile {
  username: string;
  patterns: Pattern[];
  // ... other user profile properties
}

// Mock implementations for now until utils are converted to TypeScript
async function analyzeGameHistory(games: Game[]): Promise<Pattern[]> {
  console.warn('[Patterns Route] Mocking analyzeGameHistory.');
  // Simulate analysis and return some mock patterns
  return [
    { type: 'missed_tactics', description: 'Missing simple forks', frequency: 5 },
    { type: 'blunders', description: 'Hanging pieces in opening', frequency: 3 },
  ];
}

async function getOrCreateUserProfile(username: string, patterns?: Pattern[]): Promise<UserProfile> {
  console.warn('[Patterns Route] Mocking getOrCreateUserProfile.');
  // Simulate fetching or creating a user profile
  return {
    username: username,
    patterns: patterns || [],
    // ... mock other properties
  };
}

// Analyze user's game history and detect patterns
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { username, games } = req.body as { username: string; games: Game[] };
    
    if (!username || !games || games.length === 0) {
      return res.status(400).json({ error: 'Username and games are required' });
    }

    // Analyze patterns
    const patterns: Pattern[] = await analyzeGameHistory(games);
    
    // Save user profile and patterns (mocked for now)
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
