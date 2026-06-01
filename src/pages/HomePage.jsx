import { useState } from 'react';

function HomePage({ onStart }) {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a Chess.com username');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Verify username exists
      const res = await fetch(`/api/chess-com/profile/${username}`);
      if (!res.ok) {
        throw new Error('User not found');
      }
      onStart(username);
    } catch (err) {
      setError('Chess.com user not found. Please check the username.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            ♟ Vulcan Chess
          </h1>
          <p className="text-xl text-gray-300 mb-2">Personalized Chess Improvement</p>
          <p className="text-gray-400">
            Analyze your Chess.com games and get targeted lessons for your specific mistakes
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-8 shadow-2xl">
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
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? 'Analyzing...' : 'Analyze My Games'}
          </button>
        </form>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">🎯</div>
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
