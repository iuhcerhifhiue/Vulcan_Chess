import { useState, useEffect } from 'react';

function LoadingScreen() {
  const [step, setStep] = useState(0);

  const steps = [
    'Connecting to Chess.com...',
    'Downloading your game history...',
    'Detecting recurring patterns...',
    'Crafting your personalized lessons...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated Chess Piece */}
        <div className="mb-12">
          <div className="text-8xl animate-bounce">♟</div>
        </div>

        <h1 className="text-3xl font-bold mb-8">Vulcan Chess</h1>

        {/* Progress Steps */}
        <div className="mb-12">
          {steps.map((stepText, index) => (
            <div
              key={index}
              className={`py-3 px-4 mb-3 rounded-lg transition-all duration-500 ${
                index < step
                  ? 'bg-green-900 text-green-200'
                  : index === step
                  ? 'bg-blue-900 text-blue-200 animate-pulse'
                  : 'bg-slate-700 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {index < step ? '✓' : index === step ? '◐' : '○'}
                </span>
                <span>{stepText}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Bar */}
        <div className="mb-8">
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <p className="text-gray-400 text-sm">This may take up to 2 minutes...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
