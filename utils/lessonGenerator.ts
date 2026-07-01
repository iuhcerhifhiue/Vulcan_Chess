import { getOrCreateUserProfile } from './database'; // Corrected import path

interface Pattern {
  title: string;
  category: string;
  frequency: number;
  description: string;
  // Add any other properties for a pattern that might be stored
}

interface LessonStep {
  step: number;
  title: string;
  type: 'analysis' | 'solution' | 'practice' | 'quiz';
  content: string;
  // Add specific fields for each step type, e.g., fen, solution, choices
}

export interface Lesson {
  id: string;
  username: string;
  title: string;
  category: string;
  frequency: number;
  description: string;
  steps: LessonStep[];
  completed: boolean;
  progress: number;
}

export async function generateLessons(username: string): Promise<Lesson[]> {
  const userProfile = await getOrCreateUserProfile(username);
  const patterns: Pattern[] = userProfile.patterns || [];

  const lessons: Lesson[] = patterns.slice(0, 3).map((pattern, index) => ({
    id: `lesson_${username}_${index + 1}`,
    username,
    title: pattern.title,
    category: pattern.category,
    frequency: pattern.frequency,
    description: pattern.description,
    steps: [
      {
        step: 1,
        title: 'What Went Wrong',
        type: 'analysis',
        content: `This pattern appeared in ${pattern.frequency} of your games. Let's analyze what happened.`,
      },
      {
        step: 2,
        title: 'The Better Move',
        type: 'solution',
        content: 'Here\'s the move you should have played instead.',
      },
      {
        step: 3,
        title: 'Practice Positions',
        type: 'practice',
        content: 'Let\'s practice similar positions.',
      },
      {
        step: 4,
        title: 'Mastery Check',
        type: 'quiz',
        content: 'Can you spot the right move here?',
      },
    ],
    completed: false,
    progress: 0,
  }));

  return lessons;
}
