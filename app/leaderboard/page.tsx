'use client';

import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, UserButton, useUser } from '@insforge/nextjs';
import { createClient } from '@insforge/sdk';
import Link from 'next/link';

interface LeaderboardEntry {
  id: string;
  score: number;
  accuracy: number;
  target_time: number;
  actual_time: number;
  target_key: string;
  created_at: string;
  user_id: string;
  users: {
    nickname: string | null;
    avatar_url: string | null;
  } | null;
}

export default function LeaderboardPage() {
  const { user } = useUser();
  const [topScores, setTopScores] = useState<LeaderboardEntry[]>([]);
  const [userScores, setUserScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'global' | 'personal'>('global');

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      const client = createClient({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!
      });

      // Fetch top 50 scores
      const { data: topData, error: topError } = await client.database
        .from('game_scores')
        .select('*, users(nickname, avatar_url)')
        .order('score', { ascending: false })
        .limit(50);

      if (topError) {
        console.error('Error fetching leaderboard:', topError);
      } else {
        setTopScores(topData || []);
      }

      // Fetch user's personal scores if signed in
      if (user?.id) {
        const { data: userData, error: userError } = await client.database
          .from('game_scores')
          .select('*, users(nickname, avatar_url)')
          .eq('user_id', user.id)
          .order('score', { ascending: false })
          .limit(20);

        if (userError) {
          console.error('Error fetching user scores:', userError);
        } else {
          setUserScores(userData || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ScoreTable = ({ scores, showRank = true }: { scores: LeaderboardEntry[], showRank?: boolean }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-purple-900/50 border-b border-purple-700">
          <tr>
            {showRank && <th className="px-4 py-3 text-left text-sm font-semibold text-purple-300">Rank</th>}
            <th className="px-4 py-3 text-left text-sm font-semibold text-purple-300">Player</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-purple-300">Score</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-purple-300">Accuracy</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-purple-300">Key</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-purple-300">Target</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-purple-300">Time</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-purple-300">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-purple-800/30">
          {scores.length === 0 ? (
            <tr>
              <td colSpan={showRank ? 8 : 7} className="px-4 py-8 text-center text-gray-500">
                No scores yet. Play a game to get started!
              </td>
            </tr>
          ) : (
            scores.map((entry, index) => (
              <tr
                key={entry.id}
                className={`hover:bg-purple-900/30 transition-colors ${
                  entry.user_id === user?.id ? 'bg-blue-900/20' : ''
                }`}
              >
                {showRank && (
                  <td className="px-4 py-3">
                    <div className={`font-bold ${
                      index === 0 ? 'text-yellow-400 text-xl' :
                      index === 1 ? 'text-gray-300 text-lg' :
                      index === 2 ? 'text-orange-400 text-lg' :
                      'text-gray-400'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {entry.users?.avatar_url && (
                      <img
                        src={entry.users.avatar_url}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-white font-medium">
                      {entry.users?.nickname || 'Anonymous'}
                      {entry.user_id === user?.id && (
                        <span className="ml-2 text-xs text-blue-400">(You)</span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-green-400 font-bold text-lg">{entry.score}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-purple-300">{entry.accuracy.toFixed(2)}%</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <kbd className="px-2 py-1 bg-blue-600 text-white rounded font-mono">
                    {entry.target_key}
                  </kbd>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-yellow-400">{formatTime(entry.target_time)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-gray-300">{formatTime(entry.actual_time)}</span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-500">
                  {formatDate(entry.created_at)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-black">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center border-b border-purple-700/30">
        <div className="flex items-center gap-8">
          <Link href="/">
            <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity">
              Focus Game
            </h1>
          </Link>
          <span className="text-gray-300 font-semibold">Leaderboard</span>
        </div>

        <div className="flex items-center gap-4">
          <SignedOut>
            <a
              href="/sign-in"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Sign In
            </a>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" mode="detailed" />
          </SignedIn>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">Leaderboard</h2>
            <p className="text-gray-400">Top players and their best scores</p>
          </div>

          {/* Tabs */}
          {user && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('global')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === 'global'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-900/30 text-gray-400 hover:bg-purple-900/50'
                }`}
              >
                Global Top 50
              </button>
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === 'personal'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-900/30 text-gray-400 hover:bg-purple-900/50'
                }`}
              >
                My Scores
              </button>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-purple-700/30 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading leaderboard...</p>
              </div>
            ) : (
              <>
                {activeTab === 'global' && <ScoreTable scores={topScores} />}
                {activeTab === 'personal' && <ScoreTable scores={userScores} showRank={false} />}
              </>
            )}
          </div>

          {/* Back to Game */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              Back to Game
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
