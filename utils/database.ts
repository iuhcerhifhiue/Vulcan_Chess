import * as admin from 'firebase-admin';

interface Pattern {
  type: string;
  description: string;
  frequency: number;
  // Add any other properties for a pattern
}

interface UserProfile {
  username: string;
  patterns: Pattern[];
  createdAt: Date;
  updatedAt?: Date;
  gamesAnalyzed: number;
}

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  lastAttempt: Date;
  // Add any other progress properties
}

let db: admin.firestore.Firestore | null = null;

try {
  if (admin.apps.length === 0 && process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    });
  }
  db = admin.firestore();
} catch (error) {
  console.log('Firebase not initialized - using mock database. Error:', (error as Error).message);
}

const mockDatabase: { [username: string]: UserProfile } = {};

export async function getOrCreateUserProfile(
  username: string,
  patterns: Pattern[] | null = null
): Promise<UserProfile> {
  try {
    if (!db) {
      // Mock database fallback
      if (!mockDatabase[username]) {
        mockDatabase[username] = {
          username,
          patterns: patterns || [],
          createdAt: new Date(),
          gamesAnalyzed: 0,
        };
      } else if (patterns) {
        // Update patterns in mock if provided
        mockDatabase[username].patterns = patterns;
        mockDatabase[username].updatedAt = new Date();
      }
      return mockDatabase[username];
    }

    const docRef = db.collection('users').doc(username);
    const doc = await docRef.get();

    if (!doc.exists) {
      const newUserProfile: UserProfile = {
        username,
        patterns: patterns || [],
        createdAt: new Date(),
        gamesAnalyzed: 0,
      };
      await docRef.set(newUserProfile);
      return newUserProfile;
    } else {
      const existingProfile = doc.data() as UserProfile;
      if (patterns && JSON.stringify(existingProfile.patterns) !== JSON.stringify(patterns)) {
        // Only update if patterns have actually changed
        await docRef.update({
          patterns,
          updatedAt: new Date(),
        });
        return { ...existingProfile, patterns, updatedAt: new Date() };
      }
      return existingProfile;
    }
  } catch (error) {
    console.error('Database error in getOrCreateUserProfile:', error);
    // Fallback to mock database even if Firebase init failed earlier but was tried again
    if (!mockDatabase[username]) {
      mockDatabase[username] = {
        username,
        patterns: patterns || [],
        createdAt: new Date(),
        gamesAnalyzed: 0,
      };
    }
    return mockDatabase[username];
  }
}

export async function saveLessonProgress(
  username: string,
  lessonId: string,
  progress: LessonProgress
): Promise<{ success: boolean; error?: any; mock?: boolean }> {
  try {
    if (!db) {
      console.warn(`[Mock DB] Saving lesson progress for ${username} - ${lessonId}.`)
      // In a real mock, you might store this in a temporary object
      return { success: true, mock: true };
    }

    await db.collection('users').doc(username).collection('lessonProgress').doc(lessonId).set(progress);
    return { success: true };
  } catch (error) {
    console.error('Database error in saveLessonProgress:', error);
    return { success: false, error };
  }
}
