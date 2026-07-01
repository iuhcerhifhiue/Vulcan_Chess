import express, { Request, Response, Router } from 'express';
import { generateLessons, Lesson } from '../utils/lessonGenerator'; // Updated import

const router: Router = express.Router();

// Get lessons for a user
router.get('/user/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const lessons: Lesson[] = await generateLessons(username);
    res.json(lessons);
  } catch (error) {
    console.error('Error generating lessons:', error);
    res.status(500).json({ error: 'Failed to generate lessons' });
  }
});

// Get specific lesson
router.get('/:lessonId', async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    // In a real application, you would fetch the lesson from a database
    // For now, returning a mock based on the lessonId
    const mockLesson: Lesson = {
      id: lessonId,
      username: 'mockUser', // Placeholder
      title: `Lesson ${lessonId}`,
      category: 'general',
      frequency: 1,
      description: `Content for lesson ${lessonId}. This is fetched from a mock source.`,
      steps: [], // Placeholder
      completed: false,
      progress: 0,
    };
    res.json(mockLesson);
  } catch (error) {
    console.error('Error fetching specific lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

export default router;
