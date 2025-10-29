'use client';

import { SignedIn, SignedOut, UserButton } from '@insforge/nextjs';
import FocusGame from '@/components/FocusGame';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center border-b border-purple-700/30">
        <div className="flex items-center gap-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Focus Game
          </h1>
          <Link
            href="/leaderboard"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Leaderboard
          </Link>
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
            <UserButton afterSignOutUrl="/" showEmail={true} />
          </SignedIn>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <FocusGame />
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full p-4 text-center text-gray-500 text-sm">
        Built with Next.js and Insforge
      </footer>
    </div>
  );
}
