import { getOrCreateUserProfile } from './database.js';

export async function generateLessons(username) {
  const userProfile = await getOrCreateUserProfile(username);
  const patterns = userProfile.patterns || [];

  const lessons = patterns.slice(0, 3).map((pattern, index) => ({
    id: `lesson_${username}_${index}`,
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
