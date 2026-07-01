import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LessonPage from './pages/LessonPage';
import LoadingScreen from './components/LoadingScreen';

interface UserProfile {
  username: string;
  followers: number;
  country: string;
  // Add more profile properties as needed
  patterns: any[]; // Define a proper type for patterns later
}

interface Lesson {
  id: string;
  title: string;
  content: any; // Define a proper type for lesson content later
  mistakeType: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [username, setUsername] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

  const handleStartAnalysis = async (chessUsername: string) => {
    setUsername(chessUsername);
    setIsLoading(true);
    setCurrentPage('loading');

    try {
      // Fetch user profile
      const profileRes = await fetch(`/api/chess-com/profile/${chessUsername}`);
      if (!profileRes.ok) {
        throw new Error(`Failed to fetch profile: ${profileRes.statusText}`);
      }
      const profileData: Omit<UserProfile, 'patterns'> = await profileRes.json();

      // Fetch archives
      const archivesRes = await fetch(`/api/chess-com/archives/${chessUsername}`);
      if (!archivesRes.ok) {
        throw new Error(`Failed to fetch archives: ${archivesRes.statusText}`);
      }
      const archivesData: { archives: string[] } = await archivesRes.json();

      // Fetch recent games (last 6 months or up to 200)
      const archives = archivesData.archives.slice(-6); // Last 6 months
      let allGames: any[] = []; // Define a proper type for games later

      for (const archiveUrl of archives) {
        const match = archiveUrl.match(/(\d{4})\/(\d{2})$/);
        if (match) {
          const [, year, month] = match;
          const gamesRes = await fetch(`/api/chess-com/games/${chessUsername}/${year}/${month}`);
          if (!gamesRes.ok) {
            console.warn(`Could not fetch games for ${year}/${month}: ${gamesRes.statusText}`);
            continue;
          }
          const gamesData: { games: any[] } = await gamesRes.json();
          allGames.push(...gamesData.games);
          if (allGames.length >= 200) break;
        }
      }

      // Analyze patterns
      const patternsRes = await fetch('/api/patterns/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: chessUsername, games: allGames.slice(0, 200) }),
      });
      if (!patternsRes.ok) {
        throw new Error(`Failed to analyze patterns: ${patternsRes.statusText}`);
      }
      const patternsData: { patterns: any[] } = await patternsRes.json();

      // Get lessons
      const lessonsRes = await fetch(`/api/lessons/user/${chessUsername}`);
      if (!lessonsRes.ok) {
        throw new Error(`Failed to fetch lessons: ${lessonsRes.statusText}`);
      }
      const lessonsData: Lesson[] = await lessonsRes.json();

      setUserProfile({ ...profileData, patterns: patternsData.patterns });
      setLessons(lessonsData);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Analysis error:', error);
      // Optionally, show an error message to the user
      setCurrentPage('home'); // Go back to home on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setCurrentPage('lesson');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setCurrentLessonId(null);
  };

  const handleBackHome = () => {
    setCurrentPage('home');
    setUsername(null);
    setUserProfile(null);
    setLessons([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {isLoading ? (
        <LoadingScreen />
      ) : currentPage === 'home' ? (
        <HomePage onStart={handleStartAnalysis} />
      ) : currentPage === 'dashboard' ? (
        <DashboardPage
          userProfile={userProfile}
          lessons={lessons}
          onStartLesson={handleStartLesson}
          onBack={handleBackHome}
        />
      ) : currentPage === 'lesson' ? (
        <LessonPage
          lesson={lessons.find((l) => l.id === currentLessonId)}
          onBack={handleBackToDashboard}
        />
      ) : null}
    </div>
  );
}

export default App;
