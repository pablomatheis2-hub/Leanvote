"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toggleVote } from "@/lib/actions/posts";
import { cn } from "@/lib/utils";
import type { PostWithDetails, Status } from "@/types/database";

interface PublicRoadmapBoardProps {
  posts: PostWithDetails[];
  userVotes: Set<string>;
  isLoggedIn: boolean;
  slug: string;
}

const statusStyles: Record<Status, { bg: string; dot: string; label: string }> = {
  Open: { bg: "bg-zinc-50", dot: "bg-zinc-400", label: "Open" },
  Planned: { bg: "bg-blue-50", dot: "bg-blue-500", label: "Planned" },
  "In Progress": { bg: "bg-amber-50", dot: "bg-amber-500", label: "In Progress" },
  Complete: { bg: "bg-emerald-50", dot: "bg-emerald-500", label: "Complete" },
};

const categoryStyles: Record<string, string> = {
  Feature: "bg-purple-50 text-purple-700 border-purple-200",
  Bug: "bg-red-50 text-red-700 border-red-200",
  Integration: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export function PublicRoadmapBoard({ posts, userVotes, isLoggedIn, slug }: PublicRoadmapBoardProps) {
  const [localVotes, setLocalVotes] = useState(userVotes);
  const [localVoteCounts, setLocalVoteCounts] = useState<Record<string, number>>(
    Object.fromEntries(posts.map(p => [p.id, p.vote_count]))
  );
  const [votingId, setVotingId] = useState<string | null>(null);

  const handleVote = async (postId: string) => {
    if (!isLoggedIn) {
      window.location.href = `/auth/login?redirect=/b/${slug}/roadmap`;
      return;
    }

    setVotingId(postId);
    const wasVoted = localVotes.has(postId);
    
    // Optimistic update
    setLocalVotes(prev => {
      const next = new Set(prev);
      if (wasVoted) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
    setLocalVoteCounts(prev => ({
      ...prev,
      [postId]: prev[postId] + (wasVoted ? -1 : 1)
    }));

    const result = await toggleVote(postId);
    
    if (result.error) {
      // Revert on error
      setLocalVotes(prev => {
        const next = new Set(prev);
        if (wasVoted) {
          next.add(postId);
        } else {
          next.delete(postId);
        }
        return next;
      });
      setLocalVoteCounts(prev => ({
        ...prev,
        [postId]: prev[postId] + (wasVoted ? 1 : -1)
      }));
    }
    
    setVotingId(null);
  };

  const columns: { status: Status; posts: PostWithDetails[] }[] = [
    { status: "Planned", posts: posts.filter(p => p.status === "Planned") },
    { status: "In Progress", posts: posts.filter(p => p.status === "In Progress") },
    { status: "Complete", posts: posts.filter(p => p.status === "Complete") },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <div key={column.status} className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className={`w-3 h-3 rounded-full ${statusStyles[column.status].dot}`} />
            <h2 className="font-semibold text-zinc-900">{column.status}</h2>
            <span className="text-sm text-zinc-400">({column.posts.length})</span>
          </div>

          <div className="space-y-3">
            {column.posts.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-zinc-200 p-6 text-center">
                <p className="text-sm text-zinc-400">No items yet</p>
              </div>
            ) : (
              column.posts.map((post) => {
                const isVoted = localVotes.has(post.id);
                const voteCount = localVoteCounts[post.id] ?? post.vote_count;
                
                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 transition-colors"
                  >
                    <h3 className="font-medium text-zinc-900 mb-2">{post.title}</h3>
                    {post.description && (
                      <p className="text-sm text-zinc-500 line-clamp-2 mb-3">
                        {post.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-xs ${categoryStyles[post.category]}`}
                      >
                        {post.category}
                      </Badge>
                      
                      {/* Voting button */}
                      <button
                        onClick={() => handleVote(post.id)}
                        disabled={votingId === post.id}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-lg border text-sm transition-all",
                          isVoted 
                            ? "bg-[#fff5f2] border-[#f97352] text-[#f97352]" 
                            : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100"
                        )}
                      >
                        <ChevronUp className={cn("w-4 h-4", isVoted && "text-[#f97352]")} />
                        <span className="font-semibold">{voteCount}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
