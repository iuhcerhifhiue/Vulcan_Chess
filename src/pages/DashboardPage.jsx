import { useState } from 'react';

function DashboardPage({ userProfile, lessons, onStartLesson, onBack }) {
  const profile = userProfile?.profile || {};
  const stats = userProfile?.stats || {};
  const patterns = userProfile?.patterns || [];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
        >
          ← Back Home
        </button>

        {/* Profile Section */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {profile.avatar && (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-20 h-20 rounded-lg"
                />
              )}
              <div>
                <h1 className="text-4xl font-bold mb-2">{profile.username}</h1>
                <p className="text-gray-400">{profile.title || 'Chess Player'}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {stats.chess_bullet && (
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Bullet</p>
                <p className="text-2xl font-bold">{stats.chess_bullet.last?.rating || 'N/A'}</p>
              </div>
            )}
            {stats.chess_blitz && (
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Blitz</p>
                <p className="text-2xl font-bold">{stats.chess_blitz.last?.rating || 'N/A'}</p>
              </div>
            )}
            {stats.chess_rapid && (
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Rapid</p>
                <p className="text-2xl font-bold">{stats.chess_rapid.last?.rating || 'N/A'}</p>
              </div>
            )}
            {stats.chess_daily && (
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Daily</p>
                <p className="text-2xl font-bold">{stats.chess_daily.last?.rating || 'N/A'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recurring Mistakes Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Recurring Mistakes</h2>
          <p className="text-gray-400 mb-6">Top patterns detected from your game history</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {patterns.slice(0, 3).map((pattern, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-blue-400 mb-1">{pattern.category}</p>
                    <h3 className="text-lg font-bold">{pattern.title}</h3>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Occurred in {pattern.frequency} of your games
                </p>
                <p className="text-gray-500 text-xs mb-6">{pattern.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lesson Queue */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Personalized Lessons</h2>
          <p className="text-gray-400 mb-6">Fix your biggest mistakes with targeted practice</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lessons.slice(0, 3).map((lesson) => (
              <div
                key={lesson.id}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer group"
                onClick={() => onStartLesson(lesson.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold bg-blue-900 text-blue-200 px-3 py-1 rounded-full">
                    {lesson.category}
                  </span>
                  <span className="text-xs text-gray-400">{lesson.frequency}x</span>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">
                  {lesson.title}
                </h3>
                <p className="text-gray-400 text-sm mb-6">{lesson.description}</p>
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors">
                  Start Lesson →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
