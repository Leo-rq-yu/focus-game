# Focus Game

A timing-based game built with Next.js and Insforge where precision matters!

## Game Features

- **Timer Challenge**: Watch the timer count up and try to press the target key exactly when it reaches the target time
- **Random Targets**: Each game generates a random target time (3-15 seconds) and a random key (A-Z, 0-9)
- **Scoring System**: Score based on accuracy - the closer you are to the target time, the higher your score!
- **Leaderboard**: Compete with other players and track your personal best scores
- **Authentication**: Sign in with Google or GitHub to save your scores

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Insforge (Backend-as-a-Service)
- **Database**: PostgreSQL (via Insforge)
- **Authentication**: OAuth (Google, GitHub) via Insforge

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Insforge account and backend set up

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd focus-game
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
NEXT_PUBLIC_INSFORGE_BASE_URL=https://your-backend-url.insforge.app
INSFORGE_BASE_URL=https://your-backend-url.insforge.app
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Play

1. Click **"Start Game"** to begin
2. Watch the timer count up
3. When you think the timer has reached the target time, press the target key shown on screen
4. Your score is calculated based on how close you were to the target time
5. Sign in to save your score to the leaderboard!

## Scoring

- **Perfect timing** (within 100ms): ~900-1000 points
- **Good timing** (within 500ms): ~700-900 points
- **Okay timing** (within 1s): ~500-700 points
- The more accurate you are, the higher your score!

## Database Schema

### game_scores table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to users)
- `target_time`: Integer (milliseconds)
- `actual_time`: Integer (milliseconds)
- `target_key`: String (1 character)
- `score`: Integer (0-1000)
- `accuracy`: Decimal (percentage)
- `created_at`: Timestamp

## Features

- ✅ Real-time timer with millisecond precision
- ✅ Keyboard event detection
- ✅ Dynamic scoring algorithm
- ✅ OAuth authentication (Google, GitHub)
- ✅ Global leaderboard (top 50)
- ✅ Personal score tracking
- ✅ Responsive design
- ✅ Beautiful gradient UI
- ✅ Row Level Security (RLS) for data protection

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

ISC

## Built With

Powered by [Insforge](https://insforge.dev) - Backend-as-a-Service platform
