"use client";

import { useState, useTransition } from "react";
import { toggleVote } from "@/lib/actions/posts";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
  postId: string;
  initialVoteCount: number;
  initialHasVoted: boolean;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
}

export function VoteButton({
  postId,
  initialVoteCount,
  initialHasVoted,
  isLoggedIn,
  onLoginRequired,
}: VoteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticVoteCount, setOptimisticVoteCount] = useState(initialVoteCount);
  const [optimisticHasVoted, setOptimisticHasVoted] = useState(initialHasVoted);

  const handleVote = () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }

    // Optimistic update
    const newHasVoted = !optimisticHasVoted;
    const newVoteCount = newHasVoted
      ? optimisticVoteCount + 1
      : optimisticVoteCount - 1;

    setOptimisticHasVoted(newHasVoted);
    setOptimisticVoteCount(newVoteCount);

    startTransition(async () => {
      const result = await toggleVote(postId);
      
      if (result.error) {
        // Revert on error
        setOptimisticHasVoted(optimisticHasVoted);
        setOptimisticVoteCount(optimisticVoteCount);
      }
    });
  };

  return (
    <button
      onClick={handleVote}
      disabled={isPending}
      className={cn(
        "flex flex-col items-center justify-center min-w-[52px] py-3 px-2 rounded-xl border transition-all duration-150",
        "hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-200",
        optimisticHasVoted
          ? "bg-zinc-900 border-zinc-900 text-white"
          : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50",
        isPending && "opacity-70"
      )}
    >
      <svg
        className={cn(
          "w-4 h-4 mb-0.5 transition-transform",
          optimisticHasVoted ? "text-white" : "text-zinc-400"
        )}
        fill={optimisticHasVoted ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 15l7-7 7 7"
        />
      </svg>
      <span className={cn(
        "text-sm font-semibold tabular-nums",
        optimisticHasVoted ? "text-white" : "text-zinc-900"
      )}>
        {optimisticVoteCount}
      </span>
    </button>
  );
}
