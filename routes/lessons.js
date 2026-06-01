import express from 'express';
import { generateLessons } from '../utils/lessonGenerator.js';

const router = express.Router();

// Get lessons for a user
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const lessons = await generateLessons(username);
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate lessons' });
  }
});

// Get specific lesson
router.get('/:lessonId', async (req, res) => {
  try {
    const { lessonId } = req.params;
    // Fetch lesson from database
    res.json({ lessonId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

export default router;
