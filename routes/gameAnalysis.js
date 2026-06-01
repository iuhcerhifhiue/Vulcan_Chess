import express from 'express';
import axios from 'axios';
import { spawn } from 'child_process';
import OpenAI from 'openai';

const router = express.Router();
const CHESS_COM_API = 'https://api.chess.com/pub';
const API_DELAY = 500;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize Stockfish
let stockfish = null;

function initStockfish() {
  return new Promise((resolve, reject) => {
    stockfish = spawn('stockfish');
    
    stockfish.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Stockfish')) {
        resolve();
      }
    });
    
    stockfish.stderr.on('data', (data) => {
      console.error(`Stockfish error: ${data}`);
    });
    
    // Send init command
    stockfish.stdin.write('uci\n');
  });
}

// Analyze position with Stockfish
async function analyzePosition(fen, depth = 20) {
  return new Promise((resolve, reject) => {
    const lines = [];
    let resolved = false;

    const onData = (data) => {
      const output = data.toString();
      lines.push(output);

      if (output.includes('bestmove') && !resolved) {
        resolved = true;
        stockfish.stdout.removeListener('data', onData);
        
        const bestmoveMatch = output.match(/bestmove (\S+)/);
        const scoreMatch = output.match(/score cp (-?\d+)/);
        
        resolve({
          bestMove: bestmoveMatch ? bestmoveMatch[1] : null,
          score: scoreMatch ? parseInt(scoreMatch[1]) / 100 : 0,
          analysis: lines.join('\n'),
        });
      }
    };

    stockfish.stdout.on('data', onData);
    
    // Send analysis command
    stockfish.stdin.write(`position fen ${fen}\n`);
    stockfish.stdin.write(`go depth ${depth}\n`);

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        stockfish.stdout.removeListener('data', onData);
        resolve({ bestMove: null, score: 0, analysis: 'Timeout' });
      }
    }, 10000);
  });
}

// Generate lesson with OpenAI
async function generateLesson(mistakeData) {
  try {
    const prompt = `You are a chess coach. A player made the following mistake:

Move: ${mistakeData.move}
Position: ${mistakeData.fen}
Best Move: ${mistakeData.bestMove}
Player's Score: ${mistakeData.playerScore}
Best Score: ${mistakeData.bestScore}
Difference: ${mistakeData.difference} points

Game Type: ${mistakeData.gameType}
Player Level: ${mistakeData.playerLevel}

Create a SHORT, personalized lesson (2-3 sentences max) that:
1. Explains why this move was a mistake
2. Suggests what the player should think about next time
3. Is encouraging and actionable

Keep it concise and practical.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI error:', error);
    return 'Could not generate lesson. Try again later.';
  }
}

// Analyze a single game
async function analyzeGame(game, username) {
  const moves = game.moves.split(' ');
  const mistakes = [];
  let fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  // Analyze every move (sampling for speed)
  for (let i = 0; i < moves.length; i += 2) {
    // Analyze white moves
    if (i < moves.length && (game.white.username === username || game.black.username === username)) {
      const analysis = await analyzePosition(fen, 18);
      
      if (analysis.bestMove && analysis.bestMove !== moves[i]) {
        const playerScore = analysis.score;
        const bestAnalysis = await analyzePosition(fen.replace(moves[i], analysis.bestMove), 18);
        
        if (playerScore - bestAnalysis.score > 1.5) {
          mistakes.push({
            moveNumber: Math.floor(i / 2) + 1,
            move: moves[i],
            bestMove: analysis.bestMove,
            playerScore,
            bestScore: bestAnalysis.score,
            difference: playerScore - bestAnalysis.score,
            fen,
            gameType: game.time_class,
            playerLevel: game.white.username === username ? 'white' : 'black',
          });
        }
      }
      
      await delay(200);
    }

    // Move to next position (simplified)
    fen = game.pgn ? game.pgn.substring(0, i * 4) : fen;
  }

  return mistakes;
}

// Main analysis endpoint
router.post('/analyze-games/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Initialize Stockfish if not already done
    if (!stockfish) {
      await initStockfish();
    }

    // Fetch archives
    const archivesRes = await axios.get(
      `${CHESS_COM_API}/player/${username}/games/archives`
    );
    const archives = archivesRes.data.archives || [];

    if (archives.length === 0) {
      return res.json({
        mistakes: [],
        lessons: [],
        message: 'No games found',
      });
    }

    // Analyze last few months of games
    const recentArchives = archives.slice(-3);
    const allMistakes = [];

    for (const archiveUrl of recentArchives) {
      const gamesRes = await axios.get(archiveUrl);
      const games = gamesRes.data.games || [];

      for (const game of games.slice(0, 5)) {
        // Limit to 5 games per archive for speed
        const mistakes = await analyzeGame(game, username);
        allMistakes.push(...mistakes);
        await delay(API_DELAY);
      }
    }

    // Group by mistake type
    const mistakeGroups = {};
    allMistakes.forEach((mistake) => {
      const key = `${mistake.move}-${mistake.bestMove}`;
      if (!mistakeGroups[key]) {
        mistakeGroups[key] = [];
      }
      mistakeGroups[key].push(mistake);
    });

    // Generate lessons for top 3 mistake patterns
    const topMistakes = Object.values(mistakeGroups)
      .sort((a, b) => b.length - a.length)
      .slice(0, 3);

    const lessons = [];
    for (const mistakeGroup of topMistakes) {
      const avgMistake = mistakeGroup[0];
      const lesson = await generateLesson({
        ...avgMistake,
        frequency: mistakeGroup.length,
      });

      lessons.push({
        mistake: `${avgMistake.move} → ${avgMistake.bestMove}`,
        frequency: mistakeGroup.length,
        lesson,
        examples: mistakeGroup.slice(0, 2),
      });

      await delay(1000); // Rate limit OpenAI
    }

    res.json({
      username,
      totalMistakesAnalyzed: allMistakes.length,
      topMistakes: allMistakes.slice(0, 5),
      lessons,
      analysis: 'Complete',
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: error.message,
      message: 'Error analyzing games',
    });
  }
});

export default router;