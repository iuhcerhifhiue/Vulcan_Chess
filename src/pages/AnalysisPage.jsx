import { useState } from 'react';

function AnalysisPage({ username }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      const res = await fetch(`/api/analysis/analyze-games/${username}`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data);
    } catch (err) {
      setError(err.message || 'Error analyzing games');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Game Analysis</h1>
          <p className="text-gray-400">
            Analyzing games for {username}
          </p>
        </div>

        {/* Action Button */}
        {!analysis && (
          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
            className="mb-8 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
          >
            {isAnalyzing ? '🔄 Analyzing your games...' : '▶ Start Analysis'}
          </button>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <p className="mt-4 text-gray-400">
              This may take a few minutes... Stockfish is analyzing your games and ChatGPT is generating personalized lessons.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6 text-red-200">
            ⚠️ {error}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">📊 Analysis Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Total Mistakes Found</p>
                  <p className="text-3xl font-bold text-blue-400">{analysis.totalMistakesAnalyzed}</p>
                </div>
                <div>
                  <p className="text-gray-400">Lessons Generated</p>
                  <p className="text-3xl font-bold text-purple-400">{analysis.lessons?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Top Lessons */}
            {analysis.lessons && analysis.lessons.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">🎯 Your Top 3 Lessons</h2>
                {analysis.lessons.map((lesson, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 border border-blue-500">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{['🥇', '🥈', '🥉'][idx]}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">
                          Move: {lesson.mistake}
                        </h3>
                        <p className="text-blue-200 mb-3">
                          Found {lesson.frequency} time{lesson.frequency > 1 ? 's' : ''} in your games
                        </p>
                        <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-3">
                          <p className="text-gray-100 leading-relaxed">
                            {lesson.lesson}
                          </p>
                        </div>
                        {lesson.examples && lesson.examples.length > 0 && (
                          <details className="text-sm text-gray-300">
                            <summary className="cursor-pointer hover:text-blue-300">
                              See examples
                            </summary>
                            <div className="mt-2 pl-4 border-l border-blue-500">
                              {lesson.examples.map((ex, i) => (
                                <p key={i} className="text-xs py-1">
                                  Game {i + 1}: Move {ex.moveNumber} - {ex.move}
                                </p>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Top Mistakes Table */}
            {analysis.topMistakes && analysis.topMistakes.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">📋 All Mistakes Found</h2>
                <div className="bg-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900">
                      <tr>
                        <th className="px-4 py-3 text-left">Move</th>
                        <th className="px-4 py-3 text-left">Best Move</th>
                        <th className="px-4 py-3 text-left">Score Difference</th>
                        <th className="px-4 py-3 text-left">Game Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.topMistakes.map((mistake, idx) => (
                        <tr key={idx} className="border-t border-slate-700 hover:bg-slate-700">
                          <td className="px-4 py-3 font-mono">{mistake.move}</td>
                          <td className="px-4 py-3 font-mono text-green-400">{mistake.bestMove}</td>
                          <td className="px-4 py-3">
                            <span className="bg-red-900 text-red-200 px-2 py-1 rounded">
                              {mistake.difference.toFixed(1)} pts
                            </span>
                          </td>
                          <td className="px-4 py-3">{mistake.gameType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalysisPage;
