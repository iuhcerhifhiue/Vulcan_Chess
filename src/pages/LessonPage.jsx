import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

function LessonPage({ lesson, onBack }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [chess] = useState(new Chess());

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Lesson not found</p>
      </div>
    );
  }

  const totalSteps = lesson.steps?.length || 4;
  const step = lesson.steps?.[currentStep - 1];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
        >
          ← Back to Dashboard
        </button>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">{lesson.title}</h1>
            <span className="text-gray-400">Step {currentStep} of {totalSteps}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Chessboard */}
          <div className="md:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="chess-board-container">
                <Chessboard position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" />
              </div>
            </div>
          </div>

          {/* Lesson Info */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="mb-6">
              <p className="text-xs font-semibold text-blue-400 mb-2">CATEGORY</p>
              <p className="text-xl font-bold mb-4">{lesson.category}</p>
              <p className="text-gray-400">{lesson.description}</p>
            </div>
            <div className="border-t border-slate-700 pt-6">
              <p className="text-xs font-semibold text-gray-400 mb-2">FREQUENCY</p>
              <p className="text-2xl font-bold text-blue-400">{lesson.frequency}x</p>
              <p className="text-sm text-gray-400 mt-2">in your recent games</p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-slate-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">{step?.title}</h2>
          <p className="text-gray-300 mb-6 text-lg">{step?.content}</p>

          {step?.type === 'analysis' && (
            <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-red-500">
              <p className="text-sm text-gray-300">This position is from one of your games where you made this mistake.</p>
            </div>
          )}

          {step?.type === 'solution' && (
            <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-300">This was the stronger move in the position.</p>
            </div>
          )}

          {step?.type === 'practice' && (
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-sm text-gray-300">Practice finding the best move in similar positions.</p>
            </div>
          )}

          {step?.type === 'quiz' && (
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-sm text-gray-300">Test your understanding. Can you find the best move?</p>
            </div>
          )}
        </div>

        {/* Step Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
          >
            ← Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i + 1)}
                className={`w-3 h-3 rounded-full transition-colors ${currentStep === i + 1 ? 'bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
            disabled={currentStep === totalSteps}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default LessonPage;
