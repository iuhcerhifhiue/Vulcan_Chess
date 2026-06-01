import { useState } from 'react';

function HomePage({ onStart }) {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  const handleValidateUsername = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a Chess.com username');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setUserInfo(null);

    try {
      const res = await fetch(`/api/chess-com/validate/${username}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'User not found');
      }

      setUserInfo(data);
    } catch (err) {
      setError(err.message || 'Chess.com user not found. Please check the username.');
      setUserInfo(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartAnalysis = () => {
    if (userInfo) {
      onStart(username);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            ♟ Vulcan Chess
          </h1>
          <p className="text-xl text-gray-300 mb-2">Personalized Chess Improvement</p>
          <p className="text-gray-400">
            Analyze your Chess.com games and get targeted lessons for your specific mistakes
          </p>
        </div>

        <form onSubmit={handleValidateUsername} className="bg-slate-800 rounded-xl p-8 shadow-2xl mb-6">
          <div className="mb-6">
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Chess.com Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Enter your Chess.com username"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-white placeholder-gray-400"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? '🔍 Validating...' : '✓ Validate Username'}
          </button>
        </form>

        {userInfo && (
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 mb-6 border border-blue-500">
            <div className="flex items-center gap-4 mb-4">
              {userInfo.avatar && (
                <img
                  src={userInfo.avatar}
                  alt={userInfo.username}
                  className="w-16 h-16 rounded-lg"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">{userInfo.username}</h2>
                <p className="text-blue-200">{userInfo.title}</p>
                {userInfo.followers && (
                  <p className="text-sm text-gray-300">👥 {userInfo.followers} followers</p>
                )}
              </div>
            </div>
            <button
              onClick={handleStartAnalysis}
              className="w-full py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200"
            >
              📊 Analyze My Games
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">🏇</div>
            <h3 className="font-semibold mb-2">Recurring Patterns</h3>
            <p className="text-gray-400 text-sm">Detect your most common mistakes</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold mb-2">Real Game Analysis</h3>
            <p className="text-gray-400 text-sm">Learn from your actual games</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-semibold mb-2">Targeted Lessons</h3>
            <p className="text-gray-400 text-sm">Fix what makes you lose</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;