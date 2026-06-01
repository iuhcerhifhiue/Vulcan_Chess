import * as admin from 'firebase-admin';

let db;

try {
  db = admin.firestore();
} catch (error) {
  console.log('Firebase not available - using mock database');
}

const mockDatabase = {};

export async function getOrCreateUserProfile(username, patterns = null) {
  try {
    if (!db) {
      // Mock database
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

    const docRef = db.collection('users').doc(username);
    const doc = await docRef.get();

    if (!doc.exists) {
      await docRef.set({
        username,
        patterns: patterns || [],
        createdAt: new Date(),
        gamesAnalyzed: 0,
      });
    } else if (patterns) {
      await docRef.update({
        patterns,
        updatedAt: new Date(),
      });
    }

    return doc.data();
  } catch (error) {
    console.error('Database error:', error);
    return mockDatabase[username] || {};
  }
}

export async function saveLessonProgress(username, lessonId, progress) {
  try {
    if (!db) {
      return { success: true, mock: true };
    }

    await db.collection('users').doc(username).collection('lessonProgress').doc(lessonId).set(progress);
    return { success: true };
  } catch (error) {
    console.error('Database error:', error);
    return { success: false, error };
  }
}
