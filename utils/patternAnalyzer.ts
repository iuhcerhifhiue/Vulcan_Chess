import { Chess } from 'chess.js';

// Assuming this Game interface is compatible with the game objects fetched from Chess.com API
// and passed to this analyzer. This might need refinement based on actual API response structure.
interface Game {
  pgn: string; // Full PGN string of the game
  moves: string; // A space-separated string of moves, as used in the original JS file
  white: { username: string };
  black: { username: string };
  username: string; // The username of the player whose patterns are being analyzed
  // Add other properties that are used from the game object if needed
}

interface Pattern {
  type: 'Tactics' | 'Opening' | 'MaterialBlunder' | 'Endgame'; // More specific types for pattern categories
  title: string;
  frequency: number;
  category: string;
  description: string;
}

interface AnalyzedPatterns {
  tacticalBlindspots: Record<string, number>;
  openingDeviations: Record<string, number>;
  materialBlunders: Record<string, number>;
  endgamePatterns: Record<string, number>;
}

export async function analyzeGameHistory(games: Game[]): Promise<Pattern[]> {
  const patterns: AnalyzedPatterns = {
    tacticalBlindspots: {},
    openingDeviations: {},
    materialBlunders: {},
    endgamePatterns: {},
  };

  for (const game of games) {
    try {
      const chess = new Chess();
      const moves = game.moves.split(' ');
      // Determine if the analyzed player is white or black in this game
      const playerColor = game.white.username.toLowerCase() === game.username.toLowerCase() ? 'white' : 'black';
      
      for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        // Store FEN before move for potential analysis (though not fully utilized in original JS)
        // const beforeFen = chess.fen(); 
        
        // Apply move. Use { sloppy: true } for PGN moves that chess.js might not parse strictly
        const moveResult = chess.move(move, { sloppy: true });

        if (moveResult) {
          // const afterFen = chess.fen();

          // Simplified check for opening deviations (first 20 half-moves)
          if (i < 20) {
            const openingKey = `${Math.floor(i / 2) + 1}_move_opening`; // +1 to make it 1-indexed move number
            patterns.openingDeviations[openingKey] = (patterns.openingDeviations[openingKey] || 0) + 1;
          }

          // Simplified check for material loss (assuming 'move' string length implies a capture or a specific type of move)
          // This logic is very basic and needs actual material evaluation for real blunders.
          // The original JS had `if (move.length > 2)`, which is a weak heuristic.
          // For now, I'll keep the heuristic, but mark for improvement.
          if (move.length > 2 && moveResult.captured) { // Refined heuristic: if move looks like a capture
            patterns.materialBlunders[move] = (patterns.materialBlunders[move] || 0) + 1;
          }
          // More sophisticated pattern detection would go here, involving Stockfish or deeper chess.js analysis
        } else {
          console.warn(`Invalid move encountered: ${move} in game PGN: ${game.pgn}`);
        }
      }
    } catch (error) {
      console.error(`Error analyzing game ${game.url}:`, error);
    }
  }

  // Convert to array and sort by frequency
  const patternArray: Pattern[] = [
    ...Object.entries(patterns.materialBlunders).map(([move, count]) => ({
      type: 'MaterialBlunder',
      title: `Frequent Material Blunder on move: ${move}`,
      frequency: count,
      category: 'Tactics',
      description: `You frequently make a material blundering move: ${move}, occurring ${count} times in your analyzed games.`, // More descriptive
    })),
    ...Object.entries(patterns.openingDeviations).map(([key, count]) => ({
      type: 'Opening',
      title: `Recurring Opening Deviation around ${key}`,
      frequency: count,
      category: 'Opening',
      description: `You show a recurring pattern in the ${key} phase of the opening, occurring ${count} times.`, // More descriptive
    })),
    // Add other pattern types here when implemented
  ];

  return patternArray.sort((a, b) => b.frequency - a.frequency);
}
