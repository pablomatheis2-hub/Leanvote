"use client";

import { useState } from "react";
import { PostCard } from "./post-card";
import { CreatePostDialog } from "./create-post-dialog";
import { Button } from "@/components/ui/button";
import type { PostWithDetails } from "@/types/database";
import { cn } from "@/lib/utils";

interface PostListProps {
  posts: PostWithDetails[];
  userVotes: Set<string>;
  isLoggedIn: boolean;
}

type SortOption = "votes" | "newest";

export function PostList({ posts, userVotes, isLoggedIn }: PostListProps) {
  const [sort, setSort] = useState<SortOption>("votes");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const sortedPosts = [...posts].sort((a, b) => {
    if (sort === "votes") {
      return b.vote_count - a.vote_count;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleLoginRequired = () => {
    setShowLoginPrompt(true);
    setTimeout(() => setShowLoginPrompt(false), 3000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg">
          <button
            onClick={() => setSort("votes")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              sort === "votes"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Most Voted
          </button>
          <button
            onClick={() => setSort("newest")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              sort === "newest"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Newest
          </button>
        </div>
        <CreatePostDialog isLoggedIn={isLoggedIn} onLoginRequired={handleLoginRequired} />
      </div>

      {showLoginPrompt && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Please log in to vote or submit feedback.
        </div>
      )}

      <div className="space-y-3">
        {sortedPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-900 mb-1">No feedback yet</h3>
            <p className="text-zinc-500 text-sm mb-4">Be the first to share your thoughts.</p>
            <CreatePostDialog isLoggedIn={isLoggedIn} onLoginRequired={handleLoginRequired} />
          </div>
        ) : (
          sortedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              hasVoted={userVotes.has(post.id)}
              isLoggedIn={isLoggedIn}
              onLoginRequired={handleLoginRequired}
            />
          ))
        )}
      </div>
    </div>
  );
}
