import express from 'express';
import axios from 'axios';

const router = express.Router();
const CHESS_COM_API = 'https://api.chess.com/pub';
const API_DELAY = 500;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Validate username exists on Chess.com
router.get('/validate/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const response = await axios.get(`${CHESS_COM_API}/player/${username}`, {
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
  } catch (error) {
    if (error.response?.status === 404) {
      res.status(404).json({ 
        valid: false, 
        error: 'Chess.com user not found. Please check the username.' 
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(503).json({ 
        valid: false, 
        error: 'Chess.com API timeout. Please try again.' 
      });
    } else {
      res.status(500).json({ 
        valid: false, 
        error: 'Error connecting to Chess.com' 
      });
    }
  }
});

// Fetch user profile
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const profileRes = await axios.get(`${CHESS_COM_API}/player/${username}`, {
      timeout: 5000,
    });
    await delay(API_DELAY);
    
    let statsRes;
    try {
      statsRes = await axios.get(`${CHESS_COM_API}/player/${username}/stats`, {
        timeout: 5000,
      });
      await delay(API_DELAY);
    } catch (error) {
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
    res.status(404).json({ error: 'User not found' });
  }
});

// Fetch game archives metadata
router.get('/archives/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const archivesRes = await axios.get(
      `${CHESS_COM_API}/player/${username}/games/archives`,
      { timeout: 5000 }
    );
    await delay(API_DELAY);
    
    res.json({
      archives: archivesRes.data.archives || [],
      count: archivesRes.data.archives?.length || 0,
    });
  } catch (error) {
    res.status(404).json({ error: 'Archives not found' });
  }
});

// Fetch games from specific archive
router.get('/games/:username/:year/:month', async (req, res) => {
  try {
    const { username, year, month } = req.params;
    
    if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Invalid year or month format' });
    }
    
    const gamesRes = await axios.get(
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
    res.status(404).json({ error: 'Games not found for this month' });
  }
});

// Get player's current online status
router.get('/status/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const statusRes = await axios.get(
      `${CHESS_COM_API}/player/${username}/is-online`,
      { timeout: 5000 }
    );
    
    res.json({
      username,
      isOnline: statusRes.data.is_online,
    });
  } catch (error) {
    res.status(404).json({ error: 'Could not fetch status' });
  }
});

export default router;