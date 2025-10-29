"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth, useUser } from "@insforge/nextjs";
import { createClient } from "@insforge/sdk";

type GameState = "idle" | "playing" | "finished";

interface GameScore {
  targetTime: number;
  actualTime: number;
  targetKey: string;
  score: number;
  accuracy: number;
}

const VALID_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");

export default function FocusGame() {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const [gameState, setGameState] = useState<GameState>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [targetTime, setTargetTime] = useState(0);
  const [targetKey, setTargetKey] = useState("");
  const [lastScore, setLastScore] = useState<GameScore | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  // Generate random target time (3-7 seconds in milliseconds)
  const generateTargetTime = () => {
    return Math.floor(Math.random() * 4000) + 3000; // 3-7 seconds
  };

  // Generate random target key
  const generateTargetKey = () => {
    return VALID_KEYS[Math.floor(Math.random() * VALID_KEYS.length)];
  };

  // Calculate score based on accuracy
  const calculateScore = (
    target: number,
    actual: number
  ): { score: number; accuracy: number } => {
    const difference = Math.abs(target - actual);
    const accuracy = Math.max(0, 100 - (difference / target) * 100);
    const score = Math.round(accuracy * 10); // Score out of 1000
    return { score, accuracy: parseFloat(accuracy.toFixed(2)) };
  };

  // Update timer
  const updateTimer = useCallback(() => {
    if (gameState === "playing") {
      const elapsed = Date.now() - startTimeRef.current;
      setCurrentTime(elapsed);
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
  }, [gameState]);

  // Start game
  const startGame = () => {
    const newTargetTime = generateTargetTime();
    const newTargetKey = generateTargetKey();

    setTargetTime(newTargetTime);
    setTargetKey(newTargetKey);
    setCurrentTime(0);
    setLastScore(null);
    setGameState("playing");
    startTimeRef.current = Date.now();
  };

  // Handle key press
  const handleKeyPress = useCallback(
    async (event: KeyboardEvent) => {
      if (gameState !== "playing") return;

      const pressedKey = event.key.toUpperCase();
      if (pressedKey === targetKey) {
        // Stop the timer
        cancelAnimationFrame(animationFrameRef.current);

        const finalTime = currentTime;
        const { score, accuracy } = calculateScore(targetTime, finalTime);

        const gameScore: GameScore = {
          targetTime,
          actualTime: finalTime,
          targetKey,
          score,
          accuracy,
        };

        setLastScore(gameScore);
        setGameState("finished");

        // Submit score to database if user is signed in
        if (isSignedIn && user?.id) {
          setIsSubmitting(true);
          console.log("Submitting score for user:", user.id);

          const submitScore = async () => {
            try {
              const token = localStorage.getItem("insforge-auth-token");
              console.log("Token exists:", !!token);

              const client = createClient({
                baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
              });

              const { data, error } = await client.database
                .from("game_scores")
                .insert([
                  {
                    user_id: user.id,
                    target_time: targetTime,
                    actual_time: finalTime,
                    target_key: targetKey,
                    score,
                    accuracy,
                  },
                ])
                .select();

              if (error) {
                console.error("Database error:", error);
              } else {
                console.log("Score submitted successfully:", data);
              }
            } catch (error) {
              console.error("Failed to submit score:", error);
            } finally {
              setIsSubmitting(false);
            }
          };

          submitScore();
        } else {
          console.log("Not signed in or no user ID");
        }
      }
    },
    [gameState, targetKey, currentTime, targetTime, isSignedIn, user]
  );

  // Set up key listener
  useEffect(() => {
    if (gameState === "playing") {
      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [gameState, handleKeyPress]);

  // Start timer animation
  useEffect(() => {
    if (gameState === "playing") {
      animationFrameRef.current = requestAnimationFrame(updateTimer);
      return () => cancelAnimationFrame(animationFrameRef.current);
    }
  }, [gameState, updateTimer]);

  // Format time display (2 decimal places)
  const formatTime = (ms: number) => {
    const seconds = (ms / 1000).toFixed(2);
    return `${seconds}s`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
      {/* Timer Display */}
      <div className="text-center">
        {gameState === "idle" && (
          <div className="text-6xl font-bold text-gray-400">Ready?</div>
        )}

        {gameState === "playing" && (
          <div className="space-y-6">
            <div className="text-8xl font-bold text-purple-400 tabular-nums">
              {formatTime(currentTime)}
            </div>
            <div className="text-3xl text-gray-300">
              Target:{" "}
              <span className="text-yellow-400 font-bold">
                {formatTime(targetTime)}
              </span>
            </div>
            <div className="text-2xl text-gray-300">
              Press:{" "}
              <kbd className="px-4 py-2 bg-blue-600 text-white rounded-lg font-mono text-3xl">
                {targetKey}
              </kbd>
            </div>
          </div>
        )}

        {gameState === "finished" && lastScore && (
          <div className="space-y-6 animate-pulse">
            <div className="text-6xl font-bold text-green-400">
              Score: {lastScore.score}
            </div>
            <div className="text-3xl text-gray-300">
              Accuracy: {lastScore.accuracy.toFixed(2)}%
            </div>
            <div className="text-xl text-gray-400">
              Target: {formatTime(lastScore.targetTime)} | Your Time:{" "}
              {formatTime(lastScore.actualTime)}
            </div>
            {isSubmitting && (
              <div className="text-sm text-blue-400">Submitting score...</div>
            )}
            {!isSignedIn && (
              <div className="text-sm text-yellow-500">
                Sign in to save your score to the leaderboard!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        {(gameState === "idle" || gameState === "finished") && (
          <button
            onClick={startGame}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xl font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            {gameState === "idle" ? "Start Game" : "Play Again"}
          </button>
        )}
      </div>

      {/* Instructions */}
      {gameState === "idle" && (
        <div className="max-w-md text-center text-gray-400 space-y-2">
          <p className="text-lg">How to play:</p>
          <ul className="text-sm space-y-1">
            <li>• Watch the timer count up</li>
            <li>
              • Try to press the target key exactly when the timer reaches the
              target time
            </li>
            <li>• The closer you are, the higher your score!</li>
            <li>• Sign in to save your scores to the leaderboard</li>
          </ul>
        </div>
      )}
    </div>
  );
}
