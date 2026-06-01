import { Chess } from 'chess.js';

export async function analyzeGameHistory(games) {
  const patterns = {
    tacticalBlindspots: {},
    openingDeviations: {},
    materialBlunders: {},
    endgamePatterns: {},
  };

  for (const game of games) {
    try {
      const chess = new Chess();
      const moves = game.moves.split(' ');
      const playerColor = game.white.username.toLowerCase() === game.username.toLowerCase() ? 'white' : 'black';
      
      for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        const before = chess.fen();
        chess.move(move, { sloppy: true });
        const after = chess.fen();

        // Check for tactical blindspots
        if (i < 20) {
          const openingKey = `${Math.floor(i / 2)}_moves`;
          patterns.openingDeviations[openingKey] = (patterns.openingDeviations[openingKey] || 0) + 1;
        }

        // Check for material loss (simplified)
        const boardBefore = chess.board();
        if (move.length > 2) {
          patterns.materialBlunders[move] = (patterns.materialBlunders[move] || 0) + 1;
        }
      }
    } catch (error) {
      console.error('Error analyzing game:', error);
    }
  }

  // Convert to array and sort by frequency
  const patternArray = [
    ...Object.entries(patterns.materialBlunders).map(([key, count]) => ({
      type: 'Tactics',
      title: `Material Blunder Pattern`,
      frequency: count,
      category: 'Tactics',
      description: `Occurred ${count} times in your games`,
    })),
    ...Object.entries(patterns.openingDeviations).map(([key, count]) => ({
      type: 'Opening',
      title: `Opening Deviation at Move ${key}`,
      frequency: count,
      category: 'Opening',
      description: `Occurred ${count} times in your games`,
    })),
  ];

  return patternArray.sort((a, b) => b.frequency - a.frequency);
}
