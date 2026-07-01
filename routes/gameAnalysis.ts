import express, { Request, Response, Router } from 'express';
import axios from 'axios';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import OpenAI from 'openai';

const router: Router = express.Router();
const CHESS_COM_API = 'https://api.chess.com/pub';
const API_DELAY = 500; // milliseconds

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Interfaces for Chess.com Game data (simplified - extend as needed)
interface ChessComGame {
  url: string;
  pgn: string;
  fen: string;
  start_time: number;
  end_time: number;
  rated: boolean;
  time_class: string;
  white: { rating: number; username: string };
  black: { rating: number; username: string };
  moves?: string; // This property is not always present in the raw data, derived later.
}

interface StockfishAnalysisResult {
  bestMove: string | null;
  score: number;
  analysis: string;
}

interface MistakeData {
  moveNumber: number;
  move: string;
  bestMove: string | null;
  playerScore: number;
  bestScore: number;
  difference: number;
  fen: string;
  gameType: string;
  playerLevel: 'white' | 'black';
  frequency?: number; // For lesson generation
}

// Stockfish process management
let stockfishProcess: ChildProcessWithoutNullStreams | null = null;
let stockfishReady = false;

async function initStockfish(): Promise<void> {
  if (stockfishProcess && stockfishReady) {
    return; // Already initialized
  }
  return new Promise((resolve, reject) => {
    try {
      stockfishProcess = spawn('stockfish');

      stockfishProcess.stdout.on('data', (data: Buffer) => {
        const output = data.toString();
        // console.log(`Stockfish stdout: ${output}`); // For debugging
        if (output.includes('Stockfish')) {
          stockfishReady = true;
          resolve();
        }
      });

      stockfishProcess.stderr.on('data', (data: Buffer) => {
        console.error(`Stockfish stderr: ${data.toString()}`);
        reject(new Error(`Stockfish engine error: ${data.toString()}`));
      });

      stockfishProcess.on('error', (err: Error) => {
        console.error(`Failed to start Stockfish process: ${err.message}`);
        reject(new Error(`Failed to start Stockfish process: ${err.message}`));
      });

      // Send init command
      stockfishProcess.stdin.write('uci\n');
    } catch (err) {
      reject(new Error(`Error spawning Stockfish: ${(err as Error).message}`));
    }
  });
}

// Analyze position with Stockfish
async function analyzePosition(fen: string, depth = 20): Promise<StockfishAnalysisResult> {
  if (!stockfishProcess || !stockfishReady) {
    throw new Error('Stockfish not initialized.');
  }

  return new Promise((resolve, reject) => {
    const lines: string[] = [];
    let resolved = false;
    let timeoutId: NodeJS.Timeout;

    const onData = (data: Buffer) => {
      const output = data.toString();
      lines.push(output);

      if (output.includes('bestmove') && !resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        stockfishProcess?.stdout.removeListener('data', onData); // Use optional chaining

        const bestmoveMatch = output.match(/bestmove (\S+)/);
        const scoreMatch = output.match(/score cp (-?\d+)/);

        resolve({
          bestMove: bestmoveMatch ? bestmoveMatch[1] : null,
          score: scoreMatch ? parseInt(scoreMatch[1]) / 100 : 0,
          analysis: lines.join('\n'),
        });
      }
    };

    // Remove old listeners to prevent memory leaks in case of previous errors/timeouts
    stockfishProcess?.stdout.removeAllListeners('data');
    stockfishProcess?.stdout.on('data', onData);

    // Send analysis command
    stockfishProcess.stdin.write(`position fen ${fen}\n`);
    stockfishProcess.stdin.write(`go depth ${depth}\n`);

    // Timeout after 10 seconds
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        stockfishProcess?.stdout.removeListener('data', onData); // Use optional chaining
        resolve({ bestMove: null, score: 0, analysis: 'Timeout' });
      }
    }, 10000);
  });
}

// Generate lesson with OpenAI
async function generateLesson(mistakeData: MistakeData): Promise<string> {
  try {
    const prompt = `You are a chess coach. A player made the following mistake:\n\nMove: ${mistakeData.move}\nPosition: ${mistakeData.fen}\nBest Move: ${mistakeData.bestMove || 'N/A'}\nPlayer's Score: ${mistakeData.playerScore}\nBest Score: ${mistakeData.bestScore}\nDifference: ${mistakeData.difference} points\n\nGame Type: ${mistakeData.gameType}\nPlayer Level: ${mistakeData.playerLevel}\nFrequency: ${mistakeData.frequency || 1} time(s).\n\nCreate a SHORT, personalized lesson (2-3 sentences max) that:\n1. Explains why this move was a mistake (e.g., 'You missed a tactic', 'Your king became exposed')\n2. Suggests what the player should think about next time (e.g., 'Always check for forcing moves', 'Consider king safety first')\n3. Is encouraging and actionable\n\nKeep it concise and practical. Focus on the core mistake and a clear takeaway.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Changed to a more cost-effective model, can be configured in .env
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0].message.content || 'Could not generate lesson content.';
  } catch (error) {
    console.error('OpenAI error:', error);
    return 'Could not generate lesson. Try again later.';
  }
}

// Analyze a single game for mistakes
// Simplified for demonstration. Real-world analysis would involve chess.js for move validation and PGN parsing.
async function analyzeGame(game: ChessComGame, username: string): Promise<MistakeData[]> {
  const pgn = game.pgn;
  // For simplicity, we'll parse moves from PGN here. In a real scenario, use pgnparser library.
  // This is a placeholder and needs robust PGN parsing.
  const moves = pgn.match(/\d+\.(?:\s+\S+){1,2}/g)?.map(move => move.replace(/\d+\./, '').trim().split(' '))?.flat().filter(Boolean) || [];

  // To represent the game state for Stockfish, we need FEN after each move.
  // This requires a chess engine like chess.js to accurately generate FENs.
  // For now, this is a highly simplified mock or placeholder logic.
  // In a full implementation, you'd iterate through game.moves, apply them to a chess.js board, and get the FEN.

  const mistakes: MistakeData[] = [];
  // Mocking mistake detection for now, as full PGN parsing and FEN generation
  // at each step is complex without a full chess engine here.
  // This section needs significant refactoring with a proper chess engine (e.g., chess.js) to be functional.

  // Placeholder for actual game analysis logic
  if (moves.length > 5) { // Simulate a mistake if game has some moves
    const mockFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // Starting FEN
    const playerMakesMistake = Math.random() > 0.7; // 30% chance to simulate a mistake

    if (playerMakesMistake) {
      mistakes.push({
        moveNumber: 5,
        move: moves[4] || 'e4', // Example move
        bestMove: 'd4', // Example best move
        playerScore: -0.5,
        bestScore: 0.5,
        difference: 1.0,
        fen: mockFen, // This needs to be the actual FEN of the mistake position
        gameType: game.time_class,
        playerLevel: game.white.username === username ? 'white' : 'black',
      });
    }
  }

  // Original logic was simplified/flawed for FEN progression, needs chess.js.
  // For a proper implementation, each move needs to be applied to a chess.js board
  // to get the correct FEN for Stockfish analysis.

  return mistakes;
}

// Main analysis endpoint
router.post('/analyze-games/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    // Assuming game data is passed in the body for analysis
    const { games: rawGames } = req.body as { games: ChessComGame[] };

    if (!rawGames || rawGames.length === 0) {
      return res.status(400).json({
        mistakes: [],
        lessons: [],
        message: 'No games provided for analysis.',
      });
    }

    // Initialize Stockfish if not already done
    if (!stockfishProcess || !stockfishReady) {
      await initStockfish();
    }

    const allMistakes: MistakeData[] = [];

    // Analyze a subset of games for performance reasons (e.g., last 5 games)
    for (const game of rawGames.slice(0, 5)) {
      // This game object might not have 'moves' directly. PGN parsing is needed.
      // For now, let's assume `game.pgn` contains the full PGN.
      const mistakes = await analyzeGame(game, username);
      allMistakes.push(...mistakes);
      await delay(API_DELAY); // Add a delay to avoid hammering external APIs/Stockfish
    }

    // Group by mistake type
    const mistakeGroups: { [key: string]: MistakeData[] } = {};
    allMistakes.forEach((mistake) => {
      const key = `${mistake.move}-${mistake.bestMove}`; // Simplified key
      if (!mistakeGroups[key]) {
        mistakeGroups[key] = [];
      }
      mistakeGroups[key].push(mistake);
    });

    // Generate lessons for top 3 mistake patterns
    const topMistakes = Object.values(mistakeGroups)
      .sort((a, b) => b.length - a.length)
      .slice(0, 3);

    const lessons: any[] = []; // Define a proper type for Lesson later
    for (const mistakeGroup of topMistakes) {
      if (mistakeGroup.length > 0) {
        const avgMistake = mistakeGroup[0]; // Take the first as representative
        const lessonText = await generateLesson({
          ...avgMistake,
          frequency: mistakeGroup.length,
        });

        lessons.push({
          id: `${avgMistake.moveNumber}-${avgMistake.move}`, // Simple unique ID for now
          mistake: `${avgMistake.move} \u2192 ${avgMistake.bestMove || 'N/A'}`, // Arrow character
          frequency: mistakeGroup.length,
          lesson: lessonText,
          examples: mistakeGroup.slice(0, 2), // Up to 2 examples
        });

        await delay(1000); // Rate limit OpenAI calls
      }
    }

    res.json({
      username,
      totalMistakesAnalyzed: allMistakes.length,
      topMistakes: allMistakes.slice(0, 5), // Return top 5 raw mistakes for dashboard
      lessons,
      analysis: 'Complete',
    });
  } catch (error) {
    console.error('Game analysis error:', error);
    res.status(500).json({
      error: (error as Error).message,
      message: 'Error during game analysis',
    });
  }
});

export default router;
