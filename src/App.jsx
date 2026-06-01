import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LessonPage from './pages/LessonPage';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [username, setUsername] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState(null);

  const handleStartAnalysis = async (chessUsername) => {
    setUsername(chessUsername);
    setIsLoading(true);
    setCurrentPage('loading');

    try {
      // Fetch user profile
      const profileRes = await fetch(`/api/chess-com/profile/${chessUsername}`);
      const profileData = await profileRes.json();

      // Fetch archives
      const archivesRes = await fetch(`/api/chess-com/archives/${chessUsername}`);
      const archivesData = await archivesRes.json();

      // Fetch recent games (last 6 months or up to 200)
      const archives = archivesData.archives.slice(-6); // Last 6 months
      const allGames = [];

      for (const archiveUrl of archives) {
        const match = archiveUrl.match(/(\d{4})\/(\d{2})$/);
        if (match) {
          const [, year, month] = match;
          const gamesRes = await fetch(`/api/chess-com/games/${chessUsername}/${year}/${month}`);
          const gamesData = await gamesRes.json();
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
      const patternsData = await patternsRes.json();

      // Get lessons
      const lessonsRes = await fetch(`/api/lessons/user/${chessUsername}`);
      const lessonsData = await lessonsRes.json();

      setUserProfile({ ...profileData, patterns: patternsData.patterns });
      setLessons(lessonsData);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Analysis error:', error);
      setCurrentPage('home');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLesson = (lessonId) => {
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
          lesson={lessons.find(l => l.id === currentLessonId)}
          onBack={handleBackToDashboard}
        />
      ) : null}
    </div>
  );
}

export default App;
