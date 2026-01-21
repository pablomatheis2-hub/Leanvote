"use client";

import { useState, useTransition } from "react";
import { toggleVote } from "@/lib/actions/posts";
import { cn } from "@/lib/utils";

interface VoteButtonServerProps {
  postId: string;
  initialVoteCount: number;
  initialHasVoted: boolean;
  isLoggedIn: boolean;
}

export function VoteButtonServer({
  postId,
  initialVoteCount,
  initialHasVoted,
  isLoggedIn,
}: VoteButtonServerProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticVoteCount, setOptimisticVoteCount] = useState(initialVoteCount);
  const [optimisticHasVoted, setOptimisticHasVoted] = useState(initialHasVoted);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleVote = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    const newHasVoted = !optimisticHasVoted;
    const newVoteCount = newHasVoted
      ? optimisticVoteCount + 1
      : optimisticVoteCount - 1;

    setOptimisticHasVoted(newHasVoted);
    setOptimisticVoteCount(newVoteCount);

    startTransition(async () => {
      const result = await toggleVote(postId);

      if (result.error) {
        setOptimisticHasVoted(optimisticHasVoted);
        setOptimisticVoteCount(optimisticVoteCount);
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleVote}
        disabled={isPending}
        className={cn(
          "flex flex-col items-center justify-center min-w-[64px] py-4 px-3 rounded-xl border transition-all duration-150",
          "hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-200",
          optimisticHasVoted
            ? "bg-zinc-900 border-zinc-900 text-white"
            : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50",
          isPending && "opacity-70"
        )}
      >
        <svg
          className={cn(
            "w-5 h-5 mb-1 transition-transform",
            optimisticHasVoted ? "text-white" : "text-zinc-400"
          )}
          fill={optimisticHasVoted ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
        <span
          className={cn(
            "text-lg font-semibold tabular-nums",
            optimisticHasVoted ? "text-white" : "text-zinc-900"
          )}
        >
          {optimisticVoteCount}
        </span>
      </button>
      {showLoginPrompt && (
        <p className="text-xs text-amber-600 text-center">
          Please log in to vote
        </p>
      )}
    </div>
  );
}
