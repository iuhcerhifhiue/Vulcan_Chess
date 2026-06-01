import express from 'express';
import axios from 'axios';

const router = express.Router();
const CHESS_COM_API = 'https://api.chess.com/pub';

// Fetch user profile
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const profileRes = await axios.get(`${CHESS_COM_API}/player/${username}`);
    const statsRes = await axios.get(`${CHESS_COM_API}/player/${username}/stats`);
    
    res.json({
      profile: profileRes.data,
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
    const archivesRes = await axios.get(`${CHESS_COM_API}/player/${username}/games/archives`);
    res.json(archivesRes.data);
  } catch (error) {
    res.status(404).json({ error: 'Archives not found' });
  }
});

// Fetch games from specific archive
router.get('/games/:username/:year/:month', async (req, res) => {
  try {
    const { username, year, month } = req.params;
    const gamesRes = await axios.get(
      `${CHESS_COM_API}/player/${username}/games/${year}/${month}`
    );
    res.json(gamesRes.data);
  } catch (error) {
    res.status(404).json({ error: 'Games not found' });
  }
});

export default router;
