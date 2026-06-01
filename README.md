# Vulcan Chess 🎯♟

Personalized chess improvement web app that connects to Chess.com, analyzes your game history, detects recurring mistakes, and delivers gamified interactive lessons.

## Features

✨ **Personalized Analysis**
- Connect with any Chess.com username
- Fetch and analyze your last 6 months of games (up to 200)
- Detect recurring tactical, opening, and endgame mistakes
- Identify patterns unique to YOUR play

🎮 **Interactive Lessons**
- Step-by-step lessons rooted in your real games
- Visual board analysis with move highlights
- Practice positions based on your mistakes
- Gamified progress tracking

📊 **Smart Dashboard**
- View your Chess.com profile stats
- See your top 3 recurring mistakes
- Track lesson progress
- Learn from your own game history

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + react-chessboard
- **Backend**: Node.js + Express
- **Analysis**: chess.js for move validation and game replay
- **Database**: Firebase (optional, currently uses mock DB)
- **API**: Chess.com Public API

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/iuhcerhifhiue/Vulcan_Chess.git
cd Vulcan_Chess

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### Configuration

1. **Firebase Setup (Optional)**
   - Create a Firebase project at https://console.firebase.google.com
   - Get your credentials
   - Add to `.env`:
     ```
     FIREBASE_PROJECT_ID=your_project_id
     FIREBASE_PRIVATE_KEY=your_private_key
     FIREBASE_CLIENT_EMAIL=your_client_email
     ```

2. **Development Server**
   ```bash
   npm run dev
   ```
   - Backend runs on http://localhost:5000
   - Frontend runs on http://localhost:5173

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Chess.com
- `GET /api/chess-com/profile/:username` - Get user profile and stats
- `GET /api/chess-com/archives/:username` - Get game archives list
- `GET /api/chess-com/games/:username/:year/:month` - Get games from specific month

### Pattern Analysis
- `POST /api/patterns/analyze` - Analyze games and detect patterns
- `GET /api/patterns/user/:username` - Get user's stored patterns

### Lessons
- `GET /api/lessons/user/:username` - Get personalized lessons
- `GET /api/lessons/:lessonId` - Get specific lesson

## How It Works

1. User enters Chess.com username
2. App fetches user profile and last 6 months of games
3. Pattern analyzer reviews every move in every game
4. Detects: tactical blindspots, opening deviations, material blunders, endgame patterns
5. Generates 3 personalized lessons based on top recurring mistakes
6. User completes interactive lessons with board positions from their own games

## Future Enhancements

- [ ] Stockfish integration for deeper tactical analysis
- [ ] AI-powered explanations
- [ ] Real-time lesson feedback
- [ ] Mobile app version
- [ ] Multiplayer lesson challenges
- [ ] Progress tracking and statistics
- [ ] Opening book integration
- [ ] Endgame tablebase analysis

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

Having issues? [Open an issue](https://github.com/iuhcerhifhiue/Vulcan_Chess/issues) on GitHub.

---

Made with ♟ for chess lovers everywhere.
