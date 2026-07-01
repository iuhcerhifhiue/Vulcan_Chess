import express, { Request, Response, Router } from 'express';
import axios from 'axios';

const router: Router = express.Router();
const CHESS_COM_API = 'https://api.chess.com/pub';
const API_DELAY = 500; // milliseconds

interface ChessComProfile {
  username: string;
  avatar?: string;
  name?: string;
  title?: string;
  location?: string;
  followers: number;
  joined: number;
  last_online: number;
  bio?: string;
  streaming?: boolean;
  url: string;
}

interface ChessComStats {
  chess_blitz?: { last: { rating: number } };
  chess_rapid?: { last: { rating: number } };
  chess_bullet?: { last: { rating: number } };
  // Add more stat types as needed
}

interface ChessComGame {
  url: string;
  pgn: string;
  fen: string;
  start_time: number;
  end_time: number;
  rated: boolean;
  // Add more game properties as needed
}

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Validate username exists on Chess.com
router.get('/validate/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const response = await axios.get<ChessComProfile>(`${CHESS_COM_API}/player/${username}`, {
      timeout: 5000,
    });
    
    res.json({
      valid: true,
      username: response.data.username,
      avatar: response.data.avatar,
      title: response.data.title || 'Not a titled player',
      followers: response.data.followers,
      location: response.data.location,
      joined: response.data.joined,
      lastOnline: response.data.last_online,
    });
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      res.status(404).json({ 
        valid: false, 
        error: 'Chess.com user not found. Please check the username.' 
      });
    } else if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      res.status(503).json({ 
        valid: false, 
        error: 'Chess.com API timeout. Please try again.' 
      });
    } else {
      res.status(500).json({ 
        valid: false, 
        error: 'Error connecting to Chess.com: ' + (error as Error).message 
      });
    }
  }
});

// Fetch user profile and stats
router.get('/profile/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const profileRes = await axios.get<ChessComProfile>(`${CHESS_COM_API}/player/${username}`, {
      timeout: 5000,
    });
    await delay(API_DELAY);
    
    let statsRes: { data: ChessComStats };
    try {
      statsRes = await axios.get<ChessComStats>(`${CHESS_COM_API}/player/${username}/stats`, {
        timeout: 5000,
      });
      await delay(API_DELAY);
    } catch (error) {
      // Stats might not exist for all users, or fail sometimes. Log and continue with empty stats.
      console.warn(`Could not fetch stats for ${username}: ${(error as Error).message}`);
      statsRes = { data: {} };
    }
    
    res.json({
      profile: {
        username: profileRes.data.username,
        avatar: profileRes.data.avatar,
        name: profileRes.data.name,
        title: profileRes.data.title,
        location: profileRes.data.location,
        followers: profileRes.data.followers,
        joined: profileRes.data.joined,
        lastOnline: profileRes.data.last_online,
        bio: profileRes.data.bio,
        streaming: profileRes.data.streaming,
        url: profileRes.data.url,
      },
      stats: statsRes.data,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      res.status(404).json({ error: 'User not found on Chess.com' });
    } else {
      res.status(500).json({ error: 'Failed to fetch user profile: ' + (error as Error).message });
    }
  }
});

// Fetch game archives metadata
router.get('/archives/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const archivesRes = await axios.get<{ archives: string[] }>( 
      `${CHESS_COM_API}/player/${username}/games/archives`,
      { timeout: 5000 }
    );
    await delay(API_DELAY);
    
    const archives = archivesRes.data.archives || [];
    
    res.json({
      archives,
      count: archives.length,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      res.status(404).json({ error: 'Archives not found for this user.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch game archives: ' + (error as Error).message });
    }
  }
});

// Fetch games from specific archive
router.get('/games/:username/:year/:month', async (req: Request, res: Response) => {
  try {
    const { username, year, month } = req.params;
    
    if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Invalid year or month format. Must be YYYY and MM.' });
    }
    
    const gamesRes = await axios.get<{ games: ChessComGame[] }>( 
      `${CHESS_COM_API}/player/${username}/games/${year}/${month}`,
      { timeout: 10000 }
    );
    await delay(API_DELAY);
    
    const games = gamesRes.data.games || [];
    
    res.json({
      games,
      count: games.length,
      year,
      month,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      res.status(404).json({ error: 'No games found for this month or user.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch games: ' + (error as Error).message });
    }
  }
});

// Get player's current online status
router.get('/status/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const statusRes = await axios.get<{ is_online: boolean }>( 
      `${CHESS_COM_API}/player/${username}/is-online`,
      { timeout: 5000 }
    );
    
    res.json({
      username,
      isOnline: statusRes.data.is_online,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      res.status(404).json({ error: 'User not found or status unavailable.' });
    } else {
      res.status(500).json({ error: 'Could not fetch status: ' + (error as Error).message });
    }
  }
});

export default router;
