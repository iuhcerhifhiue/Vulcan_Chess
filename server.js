import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import * as admin from 'firebase-admin';

// Routes
import chessComRoutes from './routes/chessCom.js';
import patternRoutes from './routes/patterns.js';
import lessonsRoutes from './routes/lessons.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
if (process.env.FIREBASE_PROJECT_ID) {
  try {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    });
    console.log('Firebase initialized');
  } catch (error) {
    console.log('Firebase not configured - running in demo mode');
  }
}

// Routes
app.use('/api/chess-com', chessComRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/lessons', lessonsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from frontend
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
